// Logic: Handles user authentication, registration, and profile extraction.
// Input: JSON payloads containing credentials, Authorization headers with Bearer JWT tokens.
// Output: JWT access tokens, user metadata, or HTTP error responses.

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

use crate::auth::{create_jwt_token, hash_password_pbkdf2, verify_django_password, verify_jwt_token};
use crate::models::{DbUser, LoginRequest, LoginResponse, RegisterRequest, UserProfileResponse};
use crate::state::AppState;

// Logic: Authenticates user against Django PBKDF2 password hash and issues a JWT token.
// Input: State(state): State<Arc<AppState>>, Json(payload): Json<LoginRequest>.
// Output: Result<(StatusCode, Json<LoginResponse>), (StatusCode, Json<serde_json::Value>)>.
pub async fn login_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let user_opt: Option<DbUser> = sqlx::query_as(
        r#"
        SELECT id, password, last_login, is_superuser, username,
               first_name, last_name, email, is_staff, is_active, date_joined
        FROM auth_user
        WHERE username = $1 AND is_active = true
        "#
    )
    .bind(&payload.username)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let user = match user_opt {
        Some(u) => u,
        None => return Err((StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid username or password"})))),
    };

    if !verify_django_password(&payload.password, &user.password) {
        return Err((StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid username or password"}))));
    }

    let token = create_jwt_token(
        user.id,
        &user.username,
        user.is_staff,
        &state.config.server.jwt_secret,
        state.config.server.jwt_expiration_hours,
    )
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": "Failed to create JWT token"}))))?;

    let _ = sqlx::query("UPDATE auth_user SET last_login = NOW() WHERE id = $1")
        .bind(user.id)
        .execute(&state.pool)
        .await;

    Ok((
        StatusCode::OK,
        Json(LoginResponse {
            token,
            user_id: user.id,
            username: user.username,
            is_staff: user.is_staff,
            is_superuser: user.is_superuser,
        }),
    ))
}

// Logic: Registers a new user account with Django-compatible PBKDF2 password hashing.
// Input: State(state): State<Arc<AppState>>, Json(payload): Json<RegisterRequest>.
// Output: Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)>.
pub async fn register_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    if payload.username.trim().is_empty() || payload.password.len() < 6 {
        return Err((StatusCode::BAD_REQUEST, Json(json!({"error": "Username must not be empty and password must be at least 6 characters"}))));
    }

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM auth_user WHERE username = $1)")
        .bind(&payload.username)
        .fetch_one(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    if exists {
        return Err((StatusCode::CONFLICT, Json(json!({"error": "Username already exists"}))));
    }

    let hashed_pw = hash_password_pbkdf2(&payload.password);

    let user_id: i32 = sqlx::query_scalar(
        r#"
        INSERT INTO auth_user (username, password, email, first_name, last_name, is_superuser, is_staff, is_active, date_joined)
        VALUES ($1, $2, $3, '', '', false, false, true, NOW())
        RETURNING id
        "#
    )
    .bind(&payload.username)
    .bind(&hashed_pw)
    .bind(&payload.email)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    let _ = sqlx::query(
        r#"
        INSERT INTO judge_profile (user_id, points, rating, display_rank, about)
        VALUES ($1, 0.0, 1500, 'user', '')
        ON CONFLICT DO NOTHING
        "#
    )
    .bind(user_id)
    .execute(&state.pool)
    .await;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "success",
            "user_id": user_id,
            "username": payload.username
        })),
    ))
}

// Logic: Returns profile metadata of currently authenticated user using Bearer token.
// Input: State(state): State<Arc<AppState>>, headers: HeaderMap.
// Output: Result<Json<UserProfileResponse>, (StatusCode, Json<serde_json::Value>)>.
pub async fn current_user_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(json!({"error": "Missing Authorization header"}))))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid Authorization header format"}))))?;

    let claims = verify_jwt_token(token, &state.config.server.jwt_secret)
        .map_err(|_| (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid or expired token"}))))?;

    let profile: Option<UserProfileResponse> = sqlx::query_as(
        r#"
        SELECT u.id, u.username, u.email,
               p.points, p.rating, p.display_rank, p.about,
               u.date_joined
        FROM auth_user u
        JOIN judge_profile p ON p.user_id = u.id
        WHERE u.id = $1
        "#
    )
    .bind(claims.user_id)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    match profile {
        Some(p) => Ok(Json(p)),
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "Profile not found"})))),
    }
}
