// Logic: Manages strongly typed application configuration deserialized from JSON files.
// Input: JSON configuration files on disk (config.json, local_settings.json).
// Output: AppConfig struct instance providing strongly typed settings.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub jwt_secret: String,
    pub jwt_expiration_hours: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub name: String,
    pub user: String,
    pub password: String,
    pub max_connections: u32,
    pub idle_timeout_seconds: u64,
}

impl DatabaseConfig {
    // Logic: Formats database parameters into a PostgreSQL connection URI string.
    // Input: &self reference containing host, port, credentials, and database name.
    // Output: Formatted PostgreSQL connection string.
    pub fn connection_string(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            self.user, self.password, self.host, self.port, self.name
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    pub url: String,
    pub default_ttl_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeConfig {
    pub listen_host: String,
    pub listen_port: u16,
    pub max_packet_size_bytes: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SiteConfig {
    pub name: String,
    pub long_name: String,
    pub ssl_mode: u8,
    pub registration_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub problems_dir: String,
    pub media_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub bridge: BridgeConfig,
    pub site: SiteConfig,
    pub storage: StorageConfig,
}

impl AppConfig {
    // Logic: Reads base config.json and merges optional overrides from local_settings.json.
    // Input: base_path (&Path), optional local_path (Option<&Path>).
    // Output: Result<AppConfig, Box<dyn std::error::Error>> containing validated configuration.
    pub fn load(base_path: &Path, local_path: Option<&Path>) -> Result<Self, Box<dyn std::error::Error>> {
        let base_content = fs::read_to_string(base_path)?;
        let mut config_val: serde_json::Value = serde_json::from_str(&base_content)?;

        if let Some(local) = local_path {
            if local.exists() {
                let local_content = fs::read_to_string(local)?;
                let local_val: serde_json::Value = serde_json::from_str(&local_content)?;
                merge_json(&mut config_val, &local_val);
            }
        }

        let config: AppConfig = serde_json::from_value(config_val)?;
        Ok(config)
    }
}

// Logic: Recursively overlays override values from local JSON object onto base JSON object.
// Input: a (&mut serde_json::Value base target), b (&serde_json::Value local override source).
// Output: In-place mutated base JSON value.
pub fn merge_json(a: &mut serde_json::Value, b: &serde_json::Value) {
    match (a, b) {
        (serde_json::Value::Object(a_map), serde_json::Value::Object(b_map)) => {
            for (k, v) in b_map {
                merge_json(a_map.entry(k).or_insert(serde_json::Value::Null), v);
            }
        }
        (a_val, b_val) => *a_val = b_val.clone(),
    }
}
