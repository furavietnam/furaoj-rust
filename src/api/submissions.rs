// Logic: REST endpoints for global submission feed and detailed testcase results breakdown.
// Input: Path parameter submission ID, pagination queries, and AppState.
// Output: Real-time submission status feed and individual testcase metrics.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

use crate::bridge::DispatchJob;
use crate::models::{
    DbSubmissionTestCase, SubmissionDetailResponse, SubmissionFeedItem,
};
use crate::state::AppState;
use crate::ws::LiveEvent;

// Logic: Fetches the latest submissions feed across all problems, users, and languages.
// Input: State(state): State<Arc<AppState>>.
// Output: Result<Json<Vec<SubmissionFeedItem>>, (StatusCode, Json<serde_json::Value>)>.
pub async fn list_submissions_handler(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let items: Vec<SubmissionFeedItem> = sqlx::query_as(
        r#"
        SELECT s.id, p.code as problem_code, u.username, l.common_name as language,
               s.date, s.time, s.memory, s.points, s.status, s.result
        FROM judge_submission s
        JOIN judge_problem p ON p.id = s.problem_id
        JOIN judge_profile pr ON pr.id = s.user_id
        JOIN auth_user u ON u.id = pr.user_id
        JOIN judge_language l ON l.id = s.language_id
        ORDER BY s.id DESC
        LIMIT 50
        "#
    )
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    Ok(Json(items))
}

// Logic: Fetches submission details including status, overall verdict, and individual testcase rows.
// Input: Path(id): Path<i32>, State(state): State<Arc<AppState>>.
// Output: Result<Json<SubmissionDetailResponse>, (StatusCode, Json<serde_json::Value>)>.
pub async fn get_submission_handler(
    Path(id): Path<i32>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let sub: Option<SubmissionFeedItem> = sqlx::query_as(
        r#"
        SELECT s.id, p.code as problem_code, u.username, l.common_name as language,
               s.date, s.time, s.memory, s.points, s.status, s.result
        FROM judge_submission s
        JOIN judge_problem p ON p.id = s.problem_id
        JOIN judge_profile pr ON pr.id = s.user_id
        JOIN auth_user u ON u.id = pr.user_id
        JOIN judge_language l ON l.id = s.language_id
        WHERE s.id = $1
        "#
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let sub = match sub {
        Some(s) => s,
        None => return Err((StatusCode::NOT_FOUND, Json(json!({"error": "Submission not found"})))),
    };

    let cases: Vec<DbSubmissionTestCase> = sqlx::query_as(
        r#"
        SELECT id, submission_id, case_num, status, time, memory, points, output
        FROM judge_submissiontestcase
        WHERE submission_id = $1
        ORDER BY case_num ASC
        "#
    )
    .bind(id)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    Ok(Json(SubmissionDetailResponse {
        id: sub.id,
        problem_code: sub.problem_code,
        username: sub.username,
        language: sub.language,
        date: sub.date,
        time: sub.time,
        memory: sub.memory,
        points: sub.points,
        status: sub.status,
        result: sub.result,
        cases,
    }))
}

// Logic: Resets submission status to queued ('QU'), clears prior testcase results, and re-dispatches evaluation to the bridge daemon.
// Input: Path(id): Path<i32>, State(state): State<Arc<AppState>>.
// Output: Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)>.
pub async fn rejudge_submission_handler(
    Path(id): Path<i32>,
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let sub_row: Option<(i32, String, String, f64, i32)> = sqlx::query_as(
        r#"
        SELECT s.id, p.code, l.key, p.time_limit, p.memory_limit
        FROM judge_submission s
        JOIN judge_problem p ON p.id = s.problem_id
        JOIN judge_language l ON l.id = s.language_id
        WHERE s.id = $1
        "#
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let (sub_id, problem_code, lang_key, time_limit, memory_limit) = match sub_row {
        Some(row) => row,
        None => return Err((StatusCode::NOT_FOUND, Json(json!({"error": "Submission not found"})))),
    };

    let _ = sqlx::query(
        r#"
        UPDATE judge_submission
        SET status = 'QU', result = NULL, time = NULL, memory = NULL, points = 0.0, is_rejudged = true
        WHERE id = $1
        "#
    )
    .bind(sub_id)
    .execute(&state.pool)
    .await;

    let _ = sqlx::query("DELETE FROM judge_submissiontestcase WHERE submission_id = $1")
        .bind(sub_id)
        .execute(&state.pool)
        .await;

    let job = DispatchJob {
        submission_id: sub_id,
        problem_code: problem_code.clone(),
        language: lang_key,
        source: "".to_string(),
        time_limit,
        memory_limit,
    };
    let _ = state.bridge.dispatch_submission(job).await;

    state.hub.broadcast(LiveEvent {
        event: "submission_rejudged".to_string(),
        data: serde_json::json!({
            "id": sub_id,
            "problem_code": problem_code,
            "status": "QU",
        }),
    });

    Ok((
        StatusCode::OK,
        Json(json!({
            "status": "QU",
            "submission_id": sub_id,
            "message": "Submission rejudging queued"
        })),
    ))
}
