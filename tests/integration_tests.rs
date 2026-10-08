// Logic: Integration tests verifying configuration merging, cryptographic password verification, and packet framing.
// Input: Sample configuration buffers, Django hash fixtures, and wire packet byte vectors.
// Output: Test execution assertions validating invariants.

use furaoj_rust::auth::{hash_password_pbkdf2, verify_django_password, verify_django_pbkdf2};
use furaoj_rust::bridge::{decode_packet, encode_packet};
use furaoj_rust::config::AppConfig;
use std::fs;
use tempfile::tempdir;

// Logic: Validates that local_settings.json overrides config.json values without modifying unmentioned keys.
// Input: Temporary test directory containing base and local JSON configuration files.
// Output: Asserts merged configuration fields accurately reflect local overrides.
#[test]
fn test_config_loader_merging() {
    let dir = tempdir().expect("create temp dir");
    let base_file = dir.path().join("config.json");
    let local_file = dir.path().join("local_settings.json");

    let base_json = serde_json::json!({
        "server": {
            "host": "0.0.0.0",
            "port": 8080,
            "jwt_secret": "default_secret",
            "jwt_expiration_hours": 24
        },
        "database": {
            "host": "localhost",
            "port": 5432,
            "name": "furaoj",
            "user": "furaoj",
            "password": "furaoj_password",
            "max_connections": 10,
            "idle_timeout_seconds": 30
        },
        "redis": {
            "url": "redis://localhost:6379",
            "default_ttl_seconds": 300
        },
        "bridge": {
            "listen_host": "0.0.0.0",
            "listen_port": 9999,
            "max_packet_size_bytes": 1048576
        },
        "site": {
            "name": "FuraOJ",
            "long_name": "Fura Online Judge",
            "ssl_mode": 1,
            "registration_enabled": true
        },
        "storage": {
            "problems_dir": "/var/furaoj/problems",
            "media_dir": "/var/furaoj/media"
        }
    });

    let local_json = serde_json::json!({
        "server": {
            "port": 9090,
            "jwt_secret": "custom_override_secret"
        },
        "database": {
            "host": "remote-db-host"
        }
    });

    fs::write(&base_file, serde_json::to_string(&base_json).unwrap()).unwrap();
    fs::write(&local_file, serde_json::to_string(&local_json).unwrap()).unwrap();

    let config = AppConfig::load(&base_file, Some(&local_file)).expect("load merged config");
    assert_eq!(config.server.port, 9090);
    assert_eq!(config.server.jwt_secret, "custom_override_secret");
    assert_eq!(config.database.host, "remote-db-host");
    assert_eq!(config.database.port, 5432);
    assert_eq!(config.site.name, "FuraOJ");
}

// Logic: Validates Django PBKDF2 password verification against authentic Django vectors.
// Input: Plaintext password "admin123" and Django pbkdf2_sha256 hash string.
// Output: Asserts verify_django_password returns true on correct credentials and false on incorrect.
#[test]
fn test_django_pbkdf2_authenticator() {
    let plain = "admin123";
    let valid_hash = "pbkdf2_sha256$260000$furaojsalt123456$hfk5jpjQnNJqDoI7Emmu7fOoBXuxQuaoy/MO0+Nbtms=";

    assert!(verify_django_pbkdf2(plain, valid_hash));
    assert!(verify_django_password(plain, valid_hash));
    assert!(!verify_django_password("wrong_password", valid_hash));
}

// Logic: Validates round-trip password hashing and verification using PBKDF2 HMAC-SHA256.
// Input: Arbitrary test password strings.
// Output: Asserts generated hash verifies against the original plaintext.
#[test]
fn test_password_hash_generation() {
    let plain = "super_secure_developer_password_2026";
    let hash = hash_password_pbkdf2(plain);
    assert!(hash.starts_with("pbkdf2_sha256$260000$"));
    assert!(verify_django_password(plain, &hash));
    assert!(!verify_django_password("different_password", &hash));
}

// Logic: Validates 4-byte big-endian framing and zlib wire compression roundtrip.
// Input: Sample JSON status packet string.
// Output: Asserts decompressed payload matches original JSON text byte-for-byte.
#[test]
fn test_packet_wire_protocol() {
    let original_payload = r#"{"name":"test-case-status","submission-id":1001,"status":"AC","time":0.045,"memory":2048}"#;
    let framed = encode_packet(original_payload).expect("encode packet");

    assert!(framed.len() > 4);
    let len = u32::from_be_bytes([framed[0], framed[1], framed[2], framed[3]]) as usize;
    assert_eq!(len, framed.len() - 4);

    let decoded = decode_packet(&framed[4..]).expect("decode packet");
    assert_eq!(original_payload, decoded);
}
