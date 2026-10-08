// Logic: Wire protocol encoder/decoder implementing 4-byte big-endian framing and zlib compression.
// Input: Raw network byte streams or JSON serializable data structures.
// Output: Encoded framed byte buffers or decoded serde_json::Value payloads.

use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use flate2::Compression;
use std::io::{Read, Write};

// Logic: Compresses payload string with zlib and prefixes it with a 4-byte big-endian length header.
// Input: payload (&str JSON string).
// Output: Result<Vec<u8>, std::io::Error> containing wire framed packet.
pub fn encode_packet(payload: &str) -> Result<Vec<u8>, std::io::Error> {
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(payload.as_bytes())?;
    let compressed = encoder.finish()?;

    let len = compressed.len() as u32;
    let mut packet = Vec::with_capacity(4 + compressed.len());
    packet.extend_from_slice(&len.to_be_bytes());
    packet.extend_from_slice(&compressed);

    Ok(packet)
}

// Logic: Decompresses wire packet bytes using zlib and parses into UTF-8 JSON string.
// Input: compressed_data (&[u8] compressed payload bytes).
// Output: Result<String, std::io::Error> containing decompressed UTF-8 JSON text.
pub fn decode_packet(compressed_data: &[u8]) -> Result<String, std::io::Error> {
    let mut decoder = ZlibDecoder::new(compressed_data);
    let mut decoded = String::new();
    decoder.read_to_string(&mut decoded)?;
    Ok(decoded)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wire_packet_roundtrip() {
        let original_json = r#"{"name":"ping","when":1728000000}"#;
        let encoded = encode_packet(original_json).expect("encode packet");
        assert!(encoded.len() > 4);

        let len = u32::from_be_bytes([encoded[0], encoded[1], encoded[2], encoded[3]]) as usize;
        assert_eq!(len, encoded.len() - 4);

        let decoded = decode_packet(&encoded[4..]).expect("decode packet");
        assert_eq!(original_json, decoded);
    }
}
