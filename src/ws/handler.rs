// Logic: Axum WebSocket connection upgrade and message streaming loop.
// Input: Incoming HTTP Upgrade request and State containing shared AppState.
// Output: Response initiating bidirectional WebSocket protocol.

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;

use crate::state::AppState;

// Logic: Handles the HTTP to WebSocket upgrade handshake on /ws/live.
// Input: ws (WebSocketUpgrade extractor), State(state) (Arc<AppState>).
// Output: Response upgrading connection to WebSocket.
pub async fn ws_live_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let hub = state.hub.clone();
    ws.on_upgrade(move |socket| handle_socket(socket, hub))
}

// Logic: Pumps real-time broadcast events over the active WebSocket stream until disconnect.
// Input: socket (WebSocket), hub (Arc<crate::ws::hub::EventHub>).
// Output: Completes when the client disconnects or network error occurs.
async fn handle_socket(socket: WebSocket, hub: Arc<crate::ws::hub::EventHub>) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = hub.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Close(_) = msg {
                break;
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
