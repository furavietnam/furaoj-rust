// Logic: Handles JWT session token signing and verification for API endpoints.
// Input: User claims, expiration durations, and secret HMAC keys.
// Output: Encoded JWT string tokens or validated Claims instances.

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub user_id: i32,
    pub is_staff: bool,
    pub exp: usize,
}

// Logic: Issues a signed JWT access token containing user identity and expiration.
// Input: user_id (i32), username (&str), is_staff (bool), secret (&str), expiration_hours (u64).
// Output: Result<String, jsonwebtoken::errors::Error> containing signed JWT string.
pub fn create_jwt_token(
    user_id: i32,
    username: &str,
    is_staff: bool,
    secret: &str,
    expiration_hours: u64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(expiration_hours as i64))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: username.to_string(),
        user_id,
        is_staff,
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

// Logic: Decodes and cryptographically validates a JWT token using server secret.
// Input: token (&str), secret (&str).
// Output: Result<Claims, jsonwebtoken::errors::Error> containing validated user claims.
pub fn verify_jwt_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;
    Ok(token_data.claims)
}
