// Logic: Re-exports database pool management and schema initialization routines.
// Input: Database submodules.
// Output: Unified database pool utilities.

pub mod pool;

pub use pool::{create_pool, initialize_schema};
