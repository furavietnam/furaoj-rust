// Logic: Central application state shared across all HTTP handlers and WebSocket routines.
// Input: Database pool, configuration, BridgeManager, and EventHub.
// Output: AppState struct wrapped in Arc for concurrent access.

use sqlx::PgPool;
use std::sync::Arc;

use crate::bridge::BridgeManager;
use crate::config::AppConfig;
use crate::ws::EventHub;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: AppConfig,
    pub bridge: BridgeManager,
    pub hub: Arc<EventHub>,
}
