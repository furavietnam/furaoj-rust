// Logic: REST endpoints for competitive programming contest listings, details, and live scoreboard.
// Input: Contest key path parameters, query filters, and AppState.
// Output: Contest metadata and computed ranking scoreboards.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

use crate::models::{ContestDetail, ContestListItem, DbContest, ScoreboardResponse, ScoreboardRow};
use crate::state::AppState;

// Logic: Fetches list of all visible competitive programming contests.
// Input: State(state): State<Arc<AppState>>.
// Output: Result<Json<Vec<ContestListItem>>, (StatusCode, Json<serde_json::Value>)>.
pub async fn list_contests_handler(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let rows: Vec<DbContest> = sqlx::query_as(
        r#"
        SELECT id, key, name, description, start_time, end_time, is_rated, is_visible
        FROM judge_contest
        WHERE is_visible = true
        ORDER BY start_time DESC
        "#
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let items: Vec<ContestListItem> = rows
        .into_iter()
        .map(|c| ContestListItem {
            id: c.id,
            key: c.key,
            name: c.name,
            description: c.description,
            start_time: c.start_time,
            end_time: c.end_time,
            is_rated: c.is_rated,
        })
        .collect();

    Ok(Json(items))
}

// Logic: Fetches contest details by its unique string key.
// Input: Path(key): Path<String>, State(state): State<Arc<AppState>>.
// Output: Result<Json<ContestDetail>, (StatusCode, Json<serde_json::Value>)>.
pub async fn get_contest_handler(
    Path(key): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let contest: Option<DbContest> = sqlx::query_as(
        r#"
        SELECT id, key, name, description, start_time, end_time, is_rated, is_visible
        FROM judge_contest
        WHERE key = $1 AND is_visible = true
        "#
    )
    .bind(&key)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    match contest {
        Some(c) => Ok(Json(ContestDetail {
            id: c.id,
            key: c.key,
            name: c.name,
            description: c.description,
            start_time: c.start_time,
            end_time: c.end_time,
            is_rated: c.is_rated,
        })),
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "Contest not found"})))),
    }
}

// Logic: Computes dynamic leaderboard and scoreboard for a contest.
// Input: Path(key): Path<String>, State(state): State<Arc<AppState>>.
// Output: Result<Json<ScoreboardResponse>, (StatusCode, Json<serde_json::Value>)>.
pub async fn get_scoreboard_handler(
    Path(key): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let contest: DbContest = sqlx::query_as(
        r#"
        SELECT id, key, name, description, start_time, end_time, is_rated, is_visible
        FROM judge_contest
        WHERE key = $1
        "#
    )
    .bind(&key)
    .fetch_one(&state.pool)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, Json(json!({"error": "Contest not found"}))))?;

#[derive(sqlx::FromRow)]
struct ContestPartRow {
    username: String,
    score: f64,
    cumtime: f64,
}

    let parts: Vec<ContestPartRow> = sqlx::query_as(
        r#"
        SELECT u.username, cp.score, cp.cumtime
        FROM judge_contestparticipation cp
        JOIN judge_profile pr ON pr.id = cp.user_id
        JOIN auth_user u ON u.id = pr.user_id
        WHERE cp.contest_id = $1
        ORDER BY cp.score DESC, cp.cumtime ASC
        "#
    )
    .bind(contest.id)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    let mut rows = Vec::new();
    for (i, p) in parts.into_iter().enumerate() {
        rows.push(ScoreboardRow {
            rank: i + 1,
            username: p.username,
            score: p.score,
            penalty: p.cumtime as i64,
            solved_count: (p.score / 100.0) as usize,
        });
    }

    Ok(Json(ScoreboardResponse {
        contest_key: contest.key,
        contest_name: contest.name,
        rows,
    }))
}
