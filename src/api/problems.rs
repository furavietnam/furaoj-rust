// Logic: REST endpoints for listing, viewing, and submitting solutions to competitive problems.
// Input: Path parameters, query filters, JSON submission payloads, and AppState.
// Output: Paginated problem lists, detailed markdown statements with KaTeX math, or queued submissions.

use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

use crate::auth::verify_jwt_token;
use crate::bridge::DispatchJob;
use crate::models::{DbProblem, ProblemDetail, ProblemListItem, SubmitProblemRequest, SubmitResponse};
use crate::state::AppState;
use crate::ws::LiveEvent;

// Logic: Returns paginated list of all active, public competitive programming problems.
// Input: State(state): State<Arc<AppState>>.
// Output: Result<Json<Vec<ProblemListItem>>, (StatusCode, Json<serde_json::Value>)>.
pub async fn list_problems_handler(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let rows: Vec<DbProblem> = sqlx::query_as(
        r#"
        SELECT id, code, name, description, time_limit, memory_limit, points, is_public, is_manually_managed, date_added
        FROM judge_problem
        WHERE is_public = true
        ORDER BY id ASC
        "#
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let items: Vec<ProblemListItem> = rows
        .into_iter()
        .map(|p| ProblemListItem {
            id: p.id,
            code: p.code,
            name: p.name,
            points: p.points,
            time_limit: p.time_limit,
            memory_limit: p.memory_limit,
            is_public: p.is_public,
        })
        .collect();

    Ok(Json(items))
}

// Logic: Fetches full problem statement, limits, and mathematical KaTeX formula specifications.
// Input: Path(code): Path<String>, State(state): State<Arc<AppState>>.
// Output: Result<Json<ProblemDetail>, (StatusCode, Json<serde_json::Value>)>.
pub async fn get_problem_handler(
    Path(code): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let row: Option<DbProblem> = sqlx::query_as(
        r#"
        SELECT id, code, name, description, time_limit, memory_limit, points, is_public, is_manually_managed, date_added
        FROM judge_problem
        WHERE code = $1 AND is_public = true
        "#
    )
    .bind(&code)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    match row {
        Some(p) => Ok(Json(ProblemDetail {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            time_limit: p.time_limit,
            memory_limit: p.memory_limit,
            points: p.points,
            is_public: p.is_public,
            date_added: p.date_added,
        })),
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "Problem not found"})))),
    }
}

// Logic: Receives code submission, records judge_submission record, and dispatches job to Bridge daemon.
// Input: Path(code): Path<String>, State(state): State<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<SubmitProblemRequest>.
// Output: Result<Json<SubmitResponse>, (StatusCode, Json<serde_json::Value>)>.
pub async fn submit_problem_handler(
    Path(code): Path<String>,
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<SubmitProblemRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let problem: DbProblem = sqlx::query_as(
        r#"
        SELECT id, code, name, description, time_limit, memory_limit, points, is_public, is_manually_managed, date_added
        FROM judge_problem
        WHERE code = $1
        "#
    )
    .bind(&code)
    .fetch_one(&state.pool)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, Json(json!({"error": "Problem not found"}))))?;

    let mut user_id = 1;
    if let Some(auth_val) = headers.get("Authorization").and_then(|h| h.to_str().ok()) {
        if let Some(token) = auth_val.strip_prefix("Bearer ") {
            if let Ok(claims) = verify_jwt_token(token, &state.config.server.jwt_secret) {
                user_id = claims.user_id;
            }
        }
    }

    let lang_id: i32 = sqlx::query_scalar(
        "SELECT id FROM judge_language WHERE key = $1 OR common_name = $1 LIMIT 1"
    )
    .bind(&payload.language)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None)
    .unwrap_or(1);

    let profile_id: i32 = sqlx::query_scalar(
        "SELECT id FROM judge_profile WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None)
    .unwrap_or(1);

    let sub_id: i32 = sqlx::query_scalar(
        r#"
        INSERT INTO judge_submission (problem_id, user_id, language_id, date, status, is_rejudged)
        VALUES ($1, $2, $3, NOW(), 'QU', false)
        RETURNING id
        "#
    )
    .bind(problem.id)
    .bind(profile_id)
    .bind(lang_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let job = DispatchJob {
        submission_id: sub_id,
        problem_code: problem.code.clone(),
        language: payload.language.clone(),
        source: payload.source_code.clone(),
        time_limit: problem.time_limit,
        memory_limit: problem.memory_limit,
    };

    let _ = state.bridge.dispatch_submission(job).await;

    state.hub.broadcast(LiveEvent {
        event: "submission_created".to_string(),
        data: serde_json::json!({
            "id": sub_id,
            "problem_code": problem.code,
            "status": "QU",
        }),
    });

    Ok((
        StatusCode::CREATED,
        Json(SubmitResponse {
            submission_id: sub_id,
            status: "QU".to_string(),
        }),
    ))
}
