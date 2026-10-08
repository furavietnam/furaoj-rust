// Logic: Tokio TCP Bridge Server managing judge worker connections, handshakes, and result streaming.
// Input: TCP connections on configured bridge port (default 9999), PgPool, and EventHub.
// Output: Background asynchronous listener coordinating grading workflows.

use hmac::Hmac;
use sha2::Sha256;
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use subtle::ConstantTimeEq;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, RwLock};
use tracing::{error, info, warn};

use crate::bridge::protocol::{decode_packet, encode_packet};
use crate::config::BridgeConfig;
use crate::ws::{EventHub, LiveEvent};

pub type HmacSha256 = Hmac<Sha256>;

#[derive(Clone)]
pub struct JudgeConnection {
    pub name: String,
    pub tx: mpsc::Sender<String>,
}

#[derive(Clone)]
pub struct BridgeManager {
    pub pool: PgPool,
    pub hub: Arc<EventHub>,
    pub judges: Arc<RwLock<HashMap<String, JudgeConnection>>>,
    pub submission_tx: mpsc::Sender<DispatchJob>,
}

pub struct DispatchJob {
    pub submission_id: i32,
    pub problem_code: String,
    pub language: String,
    pub source: String,
    pub time_limit: f64,
    pub memory_limit: i32,
}

impl BridgeManager {
    // Logic: Initializes the bridge manager with connected judge registry and dispatch channels.
    // Input: pool (PgPool), hub (Arc<EventHub>).
    // Output: (BridgeManager, mpsc::Receiver<DispatchJob>).
    pub fn new(pool: PgPool, hub: Arc<EventHub>) -> (Self, mpsc::Receiver<DispatchJob>) {
        let (tx, rx) = mpsc::channel(256);
        let manager = Self {
            pool,
            hub,
            judges: Arc::new(RwLock::new(HashMap::new())),
            submission_tx: tx,
        };
        (manager, rx)
    }

    // Logic: Enqueues a code submission for dispatch to connected judge workers.
    // Input: job (DispatchJob).
    // Output: Result<(), &'static str> indicating dispatch enqueue success.
    pub async fn dispatch_submission(&self, job: DispatchJob) -> Result<(), &'static str> {
        self.submission_tx
            .send(job)
            .await
            .map_err(|_| "Failed to enqueue submission dispatch job")
    }
}

// Logic: Starts the TCP Bridge daemon listening for incoming judge worker connections.
// Input: config (BridgeConfig), manager (BridgeManager), mut dispatch_rx (mpsc::Receiver<DispatchJob>).
// Output: Background asynchronous task that runs indefinitely.
pub async fn start_bridge_server(
    config: BridgeConfig,
    manager: BridgeManager,
    mut dispatch_rx: mpsc::Receiver<DispatchJob>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let bind_addr = format!("{}:{}", config.listen_host, config.listen_port);
    let listener = TcpListener::bind(&bind_addr).await?;
    info!("Tokio TCP Judge Bridge daemon listening on {}", bind_addr);

    let mgr_dispatch = manager.clone();
    tokio::spawn(async move {
        while let Some(job) = dispatch_rx.recv().await {
            let judges_guard = mgr_dispatch.judges.read().await;
            if let Some((_, conn)) = judges_guard.iter().next() {
                let packet = serde_json::json!({
                    "name": "submission-request",
                    "submission-id": job.submission_id,
                    "problem-id": job.problem_code,
                    "language": job.language,
                    "source": job.source,
                    "time-limit": job.time_limit,
                    "memory-limit": job.memory_limit,
                    "short-circuit": false,
                    "meta": {}
                });
                let _ = conn.tx.send(packet.to_string()).await;
            } else {
                warn!("No judges currently connected to handle submission {}", job.submission_id);
            }
        }
    });

    loop {
        match listener.accept().await {
            Ok((socket, addr)) => {
                let mgr = manager.clone();
                let max_packet_size = config.max_packet_size_bytes;
                tokio::spawn(async move {
                    if let Err(err) = handle_judge_connection(socket, mgr, max_packet_size).await {
                        warn!("Judge connection from {} terminated: {}", addr, err);
                    }
                });
            }
            Err(err) => {
                error!("Error accepting TCP judge connection: {}", err);
            }
        }
    }
}

// Logic: Manages TCP packet reading, HMAC handshake, and packet routing for an individual judge worker.
// Input: socket (TcpStream), manager (BridgeManager), max_packet_size (usize).
// Output: Result<(), Box<dyn std::error::Error + Send + Sync>> on termination.
async fn handle_judge_connection(
    socket: TcpStream,
    manager: BridgeManager,
    max_packet_size: usize,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (mut reader, mut writer) = socket.into_split();
    let (tx, mut rx) = mpsc::channel::<String>(128);

    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if let Ok(framed) = encode_packet(&msg) {
                if writer.write_all(&framed).await.is_err() {
                    break;
                }
            }
        }
    });

    let mut authenticated_judge: Option<String> = None;

    loop {
        let mut len_buf = [0u8; 4];
        if reader.read_exact(&mut len_buf).await.is_err() {
            break;
        }
        let packet_len = u32::from_be_bytes(len_buf) as usize;
        if packet_len > max_packet_size {
            error!("Judge sent packet exceeding max size: {} bytes", packet_len);
            break;
        }

        let mut payload_buf = vec![0u8; packet_len];
        if reader.read_exact(&mut payload_buf).await.is_err() {
            break;
        }

        let json_str = match decode_packet(&payload_buf) {
            Ok(str_val) => str_val,
            Err(err) => {
                error!("Failed to decompress judge packet: {}", err);
                break;
            }
        };

        let val: serde_json::Value = match serde_json::from_str(&json_str) {
            Ok(v) => v,
            Err(err) => {
                error!("Invalid JSON packet from judge: {}", err);
                continue;
            }
        };

        let packet_name = val.get("name").and_then(|v| v.as_str()).unwrap_or("");

        if authenticated_judge.is_none() {
            if packet_name == "handshake" {
                let judge_id = val.get("id").or_else(|| val.get("name")).and_then(|v| v.as_str()).unwrap_or("");
                let judge_key = val.get("key").and_then(|v| v.as_str()).unwrap_or("");

                let db_judge: Option<(String, bool)> = sqlx::query_as(
                    "SELECT auth_key, is_blocked FROM judge_judge WHERE name = $1"
                )
                .bind(judge_id)
                .fetch_optional(&manager.pool)
                .await
                .unwrap_or(None);

                let is_valid = if let Some((expected_key, is_blocked)) = db_judge {
                    if is_blocked {
                        false
                    } else {
                        expected_key.as_bytes().ct_eq(judge_key.as_bytes()).into()
                    }
                } else {
                    false
                };

                if is_valid {
                    authenticated_judge = Some(judge_id.to_string());
                    info!("Judge '{}' successfully authenticated", judge_id);

                    let _ = sqlx::query(
                        "UPDATE judge_judge SET online = true, start_time = NOW() WHERE name = $1"
                    )
                    .bind(judge_id)
                    .execute(&manager.pool)
                    .await;

                    let _ = tx.send(serde_json::json!({"name": "handshake-success"}).to_string()).await;

                    manager.judges.write().await.insert(
                        judge_id.to_string(),
                        JudgeConnection {
                            name: judge_id.to_string(),
                            tx: tx.clone(),
                        },
                    );
                } else {
                    warn!("Judge authentication failed for ID: {}", judge_id);
                    let _ = tx.send(serde_json::json!({"name": "bad-handshake"}).to_string()).await;
                    break;
                }
            } else {
                warn!("Judge sent non-handshake packet before auth: {}", packet_name);
                break;
            }
        } else {
            handle_judge_packet(packet_name, &val, &manager).await;
        }
    }

    if let Some(ref judge_name) = authenticated_judge {
        manager.judges.write().await.remove(judge_name);
        let _ = sqlx::query("UPDATE judge_judge SET online = false WHERE name = $1")
            .bind(judge_name)
            .execute(&manager.pool)
            .await;
        info!("Judge '{}' disconnected", judge_name);
    }

    send_task.abort();
    Ok(())
}

// Logic: Routes individual authenticated packets (testcase status, grading end) and persists state.
// Input: packet_name (&str), payload (&serde_json::Value), manager (&BridgeManager).
// Output: Asynchronously updates database and broadcasts real-time WebSocket events.
async fn handle_judge_packet(
    packet_name: &str,
    payload: &serde_json::Value,
    manager: &BridgeManager,
) {
    match packet_name {
        "submission-acknowledged" => {
            if let Some(sub_id) = payload.get("submission-id").and_then(|v| v.as_i64()) {
                let _ = sqlx::query("UPDATE judge_submission SET status = 'P' WHERE id = $1")
                    .bind(sub_id as i32)
                    .execute(&manager.pool)
                    .await;
            }
        }
        "grading-begin" => {
            if let Some(sub_id) = payload.get("submission-id").and_then(|v| v.as_i64()) {
                let _ = sqlx::query("UPDATE judge_submission SET status = 'G' WHERE id = $1")
                    .bind(sub_id as i32)
                    .execute(&manager.pool)
                    .await;

                manager.hub.broadcast(LiveEvent {
                    event: "submission_update".to_string(),
                    data: serde_json::json!({
                        "id": sub_id,
                        "status": "G",
                    }),
                });
            }
        }
        "test-case-status" => {
            if let Some(sub_id) = payload.get("submission-id").and_then(|v| v.as_i64()) {
                if let Some(cases) = payload.get("cases").and_then(|v| v.as_array()) {
                    for case in cases {
                        let position = case.get("position").and_then(|v| v.as_i64()).unwrap_or(1) as i32;
                        let status = case.get("status").and_then(|v| v.as_str()).unwrap_or("SC");
                        let time = case.get("time").and_then(|v| v.as_f64());
                        let memory = case.get("memory").and_then(|v| v.as_i64()).map(|m| m as i32);
                        let points = case.get("points").and_then(|v| v.as_f64());
                        let output = case.get("output").and_then(|v| v.as_str());

                        let _ = sqlx::query(
                            r#"
                            INSERT INTO judge_submissiontestcase (submission_id, case_num, status, time, memory, points, output)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                            ON CONFLICT DO NOTHING
                            "#
                        )
                        .bind(sub_id as i32)
                        .bind(position)
                        .bind(status)
                        .bind(time)
                        .bind(memory)
                        .bind(points)
                        .bind(output)
                        .execute(&manager.pool)
                        .await;

                        manager.hub.broadcast(LiveEvent {
                            event: "submission_case_update".to_string(),
                            data: serde_json::json!({
                                "submission_id": sub_id,
                                "case": position,
                                "status": status,
                                "time": time,
                                "memory": memory,
                            }),
                        });
                    }
                }
            }
        }
        "grading-end" => {
            if let Some(sub_id) = payload.get("submission-id").and_then(|v| v.as_i64()) {
                let result = payload.get("result").and_then(|v| v.as_str()).unwrap_or("AC");
                let points = payload.get("points").and_then(|v| v.as_f64()).unwrap_or(0.0);
                let time = payload.get("time").and_then(|v| v.as_f64());
                let memory = payload.get("memory").and_then(|v| v.as_i64()).map(|m| m as i32);

                let _ = sqlx::query(
                    r#"
                    UPDATE judge_submission
                    SET status = 'D', result = $2, points = $3, time = $4, memory = $5
                    WHERE id = $1
                    "#
                )
                .bind(sub_id as i32)
                .bind(result)
                .bind(points)
                .bind(time)
                .bind(memory)
                .execute(&manager.pool)
                .await;

                manager.hub.broadcast(LiveEvent {
                    event: "submission_done".to_string(),
                    data: serde_json::json!({
                        "id": sub_id,
                        "result": result,
                        "points": points,
                        "time": time,
                        "memory": memory,
                    }),
                });
            }
        }
        _ => {}
    }
}
