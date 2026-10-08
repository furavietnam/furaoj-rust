import { useState, useEffect, useRef, useCallback } from 'react';
import { LivePacket } from '../types';

export interface WebSocketHookState {
  isConnected: boolean;
  lastPacket: LivePacket | null;
  packets: LivePacket[];
  sendMessage: (msg: unknown) => void;
}

/**
 * Logic: Manages resilient WebSocket connection to /ws/live endpoint and streams live verdict updates.
 * Input: `submissionId` (optional number filter), `onPacket` (optional packet callback).
 * Output: WebSocketHookState containing connection status, last packet, and message sender.
 */
export function useLiveWebSocket(
  submissionId?: number | null,
  onPacket?: (packet: LivePacket) => void
): WebSocketHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastPacket, setLastPacket] = useState<LivePacket | null>(null);
  const [packets, setPackets] = useState<LivePacket[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const packet: LivePacket = JSON.parse(event.data);
          if (submissionId && packet.submission_id && packet.submission_id !== submissionId) {
            return;
          }
          setLastPacket(packet);
          setPackets((prev) => [packet, ...prev.slice(0, 49)]);
          if (onPacket) {
            onPacket(packet);
          }
        } catch {
          // Ignore unparseable socket messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Exponential backoff or standard 3-second reconnect
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [submissionId, onPacket]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastPacket, packets, sendMessage };
}
