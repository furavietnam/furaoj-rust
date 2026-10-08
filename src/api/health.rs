// Logic: Serves liveness and readiness healthcheck probes for orchestrators and load balancers.
// Input: HTTP GET request.
// Output: JSON status response.

use axum::response::IntoResponse;
use axum::Json;
use serde_json::json;

// Logic: Returns simple liveness probe payload for Docker container healthchecks.
// Input: None.
// Output: Json status object with HTTP 200.
pub async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "service": "furaoj-api",
        "version": "2.0.0"
    }))
}
