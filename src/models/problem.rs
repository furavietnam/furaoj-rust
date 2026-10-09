// Logic: Models Django judge_problem table and problem API request/response structures.
// Input: Database rows from judge_problem table and API request payloads.
// Output: Strongly typed Problem models with KaTeX statement support.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbProblem {
    pub id: i32,
    pub code: String,
    pub name: String,
    pub description: String,
    pub time_limit: f64,
    pub memory_limit: i32,
    pub points: f64,
    pub is_public: bool,
    pub is_manually_managed: bool,
    pub date_added: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemListItem {
    pub id: i32,
    pub code: String,
    pub name: String,
    pub points: f64,
    pub time_limit: f64,
    pub memory_limit: i32,
    pub is_public: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDetail {
    pub id: i32,
    pub code: String,
    pub name: String,
    pub description: String,
    pub time_limit: f64,
    pub memory_limit: i32,
    pub points: f64,
    pub is_public: bool,
    pub date_added: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SubmitProblemRequest {
    pub language: String,
    pub source_code: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateProblemRequest {
    pub code: String,
    pub name: String,
    pub description: String,
    #[serde(default = "default_time_limit")]
    pub time_limit: f64,
    #[serde(default = "default_memory_limit")]
    pub memory_limit: i32,
    #[serde(default = "default_points")]
    pub points: f64,
}

fn default_time_limit() -> f64 {
    1.0
}

fn default_memory_limit() -> i32 {
    256
}

fn default_points() -> f64 {
    100.0
}
