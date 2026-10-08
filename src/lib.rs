// Logic: Root library interface for furaoj-rust providing modular API, auth, bridge, and model components.
// Input: Internal crate submodules.
// Output: Re-exported modules and primary constructors.

pub mod api;
pub mod auth;
pub mod bridge;
pub mod config;
pub mod db;
pub mod models;
pub mod state;
pub mod ws;

pub use auth::{hash_password_pbkdf2, verify_django_password, verify_django_pbkdf2};
pub use config::{merge_json, AppConfig};
