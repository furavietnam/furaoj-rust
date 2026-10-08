// Logic: Models Django judge_submission and judge_submissiontestcase database tables.
// Input: Database rows or JSON status packets emitted by the Judge Server.
// Output: Strongly typed submission models with verdict and execution metrics.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbSubmission {
    pub id: i32,
    pub problem_id: i32,
    pub user_id: i32,
    pub language_id: i32,
    pub date: DateTime<Utc>,
    pub time: Option<f64>,
    pub memory: Option<i32>,
    pub points: Option<f64>,
    pub status: String,
    pub result: Option<String>,
    pub is_rejudged: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbSubmissionTestCase {
    pub id: i32,
    pub submission_id: i32,
    pub case_num: i32,
    pub status: String,
    pub time: Option<f64>,
    pub memory: Option<i32>,
    pub points: Option<f64>,
    pub output: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SubmissionFeedItem {
    pub id: i32,
    pub problem_code: String,
    pub username: String,
    pub language: String,
    pub date: DateTime<Utc>,
    pub time: Option<f64>,
    pub memory: Option<i32>,
    pub points: Option<f64>,
    pub status: String,
    pub result: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmissionDetailResponse {
    pub id: i32,
    pub problem_code: String,
    pub username: String,
    pub language: String,
    pub date: DateTime<Utc>,
    pub time: Option<f64>,
    pub memory: Option<i32>,
    pub points: Option<f64>,
    pub status: String,
    pub result: Option<String>,
    pub cases: Vec<DbSubmissionTestCase>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmitResponse {
    pub submission_id: i32,
    pub status: String,
}
