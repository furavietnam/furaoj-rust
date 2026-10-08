// Logic: Aggregates authentication submodules for password hashing and JWT management.
// Input: Module definitions within auth package.
// Output: Re-exported authentication structures and functions.

pub mod jwt;
pub mod password;

pub use jwt::{create_jwt_token, verify_jwt_token, Claims};
pub use password::{hash_password_pbkdf2, verify_django_password, verify_django_pbkdf2};
