// Logic: Models Django judge_profile table containing points, rating, and user statistics.
// Input: Database rows from judge_profile table.
// Output: Strongly typed DbProfile struct.

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbProfile {
    pub id: i32,
    pub user_id: i32,
    pub about: String,
    pub timezone: String,
    pub language: String,
    pub points: f64,
    pub performance_points: f64,
    pub problem_count: i32,
    pub rating: Option<i32>,
    pub display_rank: String,
}
