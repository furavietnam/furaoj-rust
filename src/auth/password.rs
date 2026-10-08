// Logic: Provides cryptographic password verification matching Django PBKDF2/SHA256 and Argon2 formats.
// Input: Plaintext password slices and encoded database hash strings.
// Output: Cryptographic boolean result and hashed string representations.

use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use subtle::ConstantTimeEq;
use rand::Rng;

// Logic: Verifies a plaintext password against Django password hash (PBKDF2 or Argon2).
// Input: password (&str plaintext), encoded (&str stored Django password hash).
// Output: bool indicating whether the password matches the hash.
pub fn verify_django_password(password: &str, encoded: &str) -> bool {
    if encoded.starts_with("pbkdf2_sha256$") {
        verify_django_pbkdf2(password, encoded)
    } else if encoded.starts_with("argon2$") || encoded.starts_with("$argon2") {
        verify_argon2(password, encoded)
    } else {
        false
    }
}

// Logic: Verifies plaintext password against Django pbkdf2_sha256$<iterations>$<salt>$<hash> string.
// Input: password (&str plaintext), encoded (&str formatted PBKDF2 string).
// Output: bool indicating if PBKDF2 HMAC-SHA256 derived key matches stored hash in constant time.
pub fn verify_django_pbkdf2(password: &str, encoded: &str) -> bool {
    let parts: Vec<&str> = encoded.split('$').collect();
    if parts.len() != 4 || parts[0] != "pbkdf2_sha256" {
        return false;
    }

    let iterations: u32 = match parts[1].parse() {
        Ok(i) => i,
        Err(_) => return false,
    };
    let salt = parts[2].as_bytes();
    let expected_hash = match BASE64.decode(parts[3]) {
        Ok(h) => h,
        Err(_) => return false,
    };

    let mut derived_key = vec![0u8; expected_hash.len()];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, iterations, &mut derived_key);

    derived_key.ct_eq(&expected_hash).into()
}

// Logic: Verifies password against Argon2 hash string.
// Input: password (&str plaintext), encoded (&str Argon2 string).
// Output: bool indicating cryptographic match.
pub fn verify_argon2(password: &str, encoded: &str) -> bool {
    use argon2::{Argon2, PasswordHash, PasswordVerifier};
    match PasswordHash::new(encoded) {
        Ok(parsed_hash) => Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok(),
        Err(_) => false,
    }
}

// Logic: Generates a Django-compatible PBKDF2-SHA256 password hash.
// Input: password (&str plaintext).
// Output: Formatted pbkdf2_sha256$<iterations>$<salt>$<hash> string.
pub fn hash_password_pbkdf2(password: &str) -> String {
    let iterations: u32 = 260000;
    let mut rng = rand::thread_rng();
    let salt_bytes: [u8; 12] = rng.gen();
    let salt = BASE64.encode(salt_bytes);

    let mut derived_key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt.as_bytes(), iterations, &mut derived_key);
    let hash_base64 = BASE64.encode(derived_key);

    format!("pbkdf2_sha256${}${}${}", iterations, salt, hash_base64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_django_pbkdf2_verification() {
        let plain = "admin123";
        let hashed = "pbkdf2_sha256$260000$furaojsalt123456$hfk5jpjQnNJqDoI7Emmu7fOoBXuxQuaoy/MO0+Nbtms=";
        assert!(verify_django_password(plain, hashed));
        assert!(!verify_django_password("wrong_password", hashed));

        let new_hash = hash_password_pbkdf2("test_secret_pass");
        assert!(verify_django_password("test_secret_pass", &new_hash));
        assert!(!verify_django_password("bad_pass", &new_hash));
    }
}
