// Logic: Re-exports bridge network daemon, manager, and packet protocol methods.
// Input: Bridge submodules.
// Output: Unified bridge types.

pub mod protocol;
pub mod server;

pub use protocol::{decode_packet, encode_packet};
pub use server::{start_bridge_server, BridgeManager, DispatchJob};
