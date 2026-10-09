// Logic: Composes Axum REST routes, WebSocket upgrades, and HTTP middlewares into unified router.
// Input: Arc<AppState> containing database pool, bridge manager, event hub, and app config.
// Output: Configured axum::Router ready to bind to TCP listener.

pub mod auth;
pub mod contests;
pub mod health;
pub mod judges;
pub mod problems;
pub mod submissions;
pub mod users;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use crate::state::AppState;
use crate::ws::ws_live_handler;

// Logic: Constructs the root Axum router with REST APIs under /api/v2, WebSockets under /ws, and middlewares.
// Input: state (Arc<AppState>).
// Output: axum::Router.
pub fn create_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let api_v2 = Router::new()
        .route("/health", get(health::health_check))
        // Auth routes
        .route("/auth/login", post(auth::login_handler))
        .route("/auth/register", post(auth::register_handler))
        .route("/auth/me", get(auth::current_user_handler))
        // Problem routes
        .route(
            "/problems",
            get(problems::list_problems_handler).post(problems::create_problem_handler),
        )
        .route("/problem/:code", get(problems::get_problem_handler))
        .route("/problem/:code/submit", post(problems::submit_problem_handler))
        // Submission routes
        .route("/submissions", get(submissions::list_submissions_handler))
        .route("/submission/:id", get(submissions::get_submission_handler))
        .route(
            "/submission/:id/rejudge",
            post(submissions::rejudge_submission_handler),
        )
        // Contest routes
        .route("/contests", get(contests::list_contests_handler))
        .route("/contest/:key", get(contests::get_contest_handler))
        .route("/contest/:key/scoreboard", get(contests::get_scoreboard_handler))
        // User routes
        .route("/users", get(users::list_users_handler))
        .route("/user/:username", get(users::get_user_handler))
        // Judge & Language cluster routes
        .route(
            "/judges",
            get(judges::list_judges_handler).post(judges::create_judge_handler),
        )
        .route("/languages", get(judges::list_languages_handler))
        // Admin statistics and control routes
        .route("/admin/stats", get(judges::admin_stats_handler))
        .route(
            "/admin/judges",
            get(judges::list_judges_handler).post(judges::create_judge_handler),
        );

    Router::new()
        .route("/health", get(health::health_check))
        .nest("/api/v2", api_v2.clone())
        .nest("/api", api_v2)
        .route("/ws/live", get(ws_live_handler))
        .route("/ws/submissions", get(ws_live_handler))
        .with_state(state)
        .layer(cors)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
}
