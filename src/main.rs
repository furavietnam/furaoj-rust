// Logic: Main application binary entry point initializing DB pool, TCP bridge, and Axum HTTP/WebSocket server.
// Input: Configuration files on disk (config.json, optional local_settings.json).
// Output: Binds HTTP service to port 8080 and Tokio TCP Bridge to port 9999.

use std::path::Path;
use std::sync::Arc;
use tracing::{error, info};

use furaoj_rust::api::create_router;
use furaoj_rust::bridge::{start_bridge_server, BridgeManager};
use furaoj_rust::config::AppConfig;
use furaoj_rust::db::{create_pool, initialize_schema};
use furaoj_rust::state::AppState;
use furaoj_rust::ws::EventHub;

// Logic: Asynchronous runtime entry point bootstrapping all services.
// Input: None (reads config.json from working directory).
// Output: Result<(), Box<dyn std::error::Error>> on graceful shutdown or startup error.
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "furaoj_rust=info,tower_http=info".into()),
        )
        .init();

    info!("Starting FuraOJ Rust Backend Server v2.0.0");

    let config_path = Path::new("config.json");
    let local_path = Path::new("local_settings.json");
    let config = AppConfig::load(config_path, Some(local_path))
        .expect("Failed to load configuration from config.json");

    info!("Configuration loaded for site: {}", config.site.name);

    let pool = match create_pool(&config.database).await {
        Ok(p) => {
            if let Err(err) = initialize_schema(&p).await {
                error!("Warning: Database schema initialization failed: {}", err);
            }
            p
        }
        Err(err) => {
            error!("Could not connect to PostgreSQL ({}), running with uninitialized pool or offline mode", err);
            create_pool(&config.database).await?
        }
    };

    let hub = Arc::new(EventHub::new());
    let (bridge, dispatch_rx) = BridgeManager::new(pool.clone(), hub.clone());

    let bridge_cfg = config.bridge.clone();
    let bridge_mgr = bridge.clone();
    tokio::spawn(async move {
        if let Err(err) = start_bridge_server(bridge_cfg, bridge_mgr, dispatch_rx).await {
            error!("TCP Bridge server error: {}", err);
        }
    });

    let state = Arc::new(AppState {
        pool,
        config: config.clone(),
        bridge,
        hub,
    });

    let app = create_router(state);

    let http_addr = format!("{}:{}", config.server.host, config.server.port);
    info!("Axum REST API listening on http://{}", http_addr);

    let listener = tokio::net::TcpListener::bind(&http_addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
