// Logic: Real-time event broadcasting hub for WebSocket clients.
// Input: JSON serializable domain events (submission updates, contest ranking changes).
// Output: Broadcasted messages to all active client WebSocket connections.

use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveEvent {
    pub event: String,
    pub data: serde_json::Value,
}

#[derive(Clone)]
pub struct EventHub {
    tx: broadcast::Sender<String>,
}

impl EventHub {
    // Logic: Initializes the broadcast event hub with an internal capacity of 1024 packets.
    // Input: None.
    // Output: New EventHub instance with active broadcast sender.
    pub fn new() -> Self {
        let (tx, _rx) = broadcast::channel(1024);
        Self { tx }
    }

    // Logic: Publishes a live event to all connected WebSocket clients.
    // Input: event (LiveEvent serializable struct).
    // Output: Result indicating count of active receivers or broadcast failure.
    pub fn broadcast(&self, event: LiveEvent) {
        if let Ok(serialized) = serde_json::to_string(&event) {
            let _ = self.tx.send(serialized);
        }
    }

    // Logic: Subscribes to the broadcast channel for an individual client connection.
    // Input: None.
    // Output: broadcast::Receiver<String> stream.
    pub fn subscribe(&self) -> broadcast::Receiver<String> {
        self.tx.subscribe()
    }
}
