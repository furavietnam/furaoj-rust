// Logic: Models Django judge_contest and contest participation tables.
// Input: Database rows representing contests and contest participants.
// Output: Strongly typed contest structures and dynamic scoreboard responses.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbContest {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub is_rated: bool,
    pub is_visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContestListItem {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub is_rated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContestDetail {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub description: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub is_rated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreboardRow {
    pub rank: usize,
    pub username: String,
    pub score: f64,
    pub penalty: i64,
    pub solved_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreboardResponse {
    pub contest_key: String,
    pub contest_name: String,
    pub rows: Vec<ScoreboardRow>,
}
