// Logic: REST endpoints for user leaderboards and individual profile lookups.
// Input: Username path parameters and AppState.
// Output: Global user leaderboard rankings and user statistics.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

use crate::models::UserProfileResponse;
use crate::state::AppState;

// Logic: Returns global user ranking list ordered by rating and total points.
// Input: State(state): State<Arc<AppState>>.
// Output: Result<Json<Vec<UserProfileResponse>>, (StatusCode, Json<serde_json::Value>)>.
pub async fn list_users_handler(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let items: Vec<UserProfileResponse> = sqlx::query_as(
        r#"
        SELECT u.id, u.username, u.email,
               p.points, p.rating, p.display_rank, p.about,
               u.date_joined
        FROM auth_user u
        JOIN judge_profile p ON p.user_id = u.id
        WHERE u.is_active = true
        ORDER BY COALESCE(p.rating, 0) DESC, p.points DESC
        LIMIT 100
        "#
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    Ok(Json(items))
}

// Logic: Fetches detailed profile of a specific user by username.
// Input: Path(username): Path<String>, State(state): State<Arc<AppState>>.
// Output: Result<Json<UserProfileResponse>, (StatusCode, Json<serde_json::Value>)>.
pub async fn get_user_handler(
    Path(username): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let user: Option<UserProfileResponse> = sqlx::query_as(
        r#"
        SELECT u.id, u.username, u.email,
               p.points, p.rating, p.display_rank, p.about,
               u.date_joined
        FROM auth_user u
        JOIN judge_profile p ON p.user_id = u.id
        WHERE u.username = $1 AND u.is_active = true
        "#
    )
    .bind(username)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    match user {
        Some(u) => Ok(Json(u)),
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "User not found"})))),
    }
}
