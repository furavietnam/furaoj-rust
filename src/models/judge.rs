// Logic: Models Django judge_judge and judge_language tables for worker authentication.
// Input: Database rows from judge_judge and judge_language tables.
// Output: Strongly typed worker and language configurations.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbJudge {
    pub id: i32,
    pub name: String,
    pub auth_key: String,
    pub is_blocked: bool,
    pub online: bool,
    pub start_time: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbLanguage {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub short_name: String,
    pub common_name: String,
    pub ace: String,
    pub template: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JudgeStatusItem {
    pub id: i32,
    pub name: String,
    pub is_blocked: bool,
    pub online: bool,
    pub start_time: Option<DateTime<Utc>>,
    pub uptime_str: String,
    pub ping_ms: f64,
    pub load: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminStatsResponse {
    pub total_problems: i64,
    pub total_submissions: i64,
    pub total_users: i64,
    pub total_contests: i64,
    pub online_judges: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateJudgeRequest {
    pub name: String,
    pub auth_key: String,
}

