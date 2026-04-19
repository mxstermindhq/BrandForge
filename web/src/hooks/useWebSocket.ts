"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  autoConnect = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Attempt reconnection
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnecting(false);
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    send,
  };
}

// Specialized hooks for different features
export function useRealtimeChat(roomId: string, userId: string) {
  const [messages, setMessages] = useState<unknown[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { isConnected, send } = useWebSocket({
    url: `wss://api.brandforge.gg/chat/${roomId}`,
    onMessage: (message) => {
      switch (message.type) {
        case "message":
          setMessages((prev) => [...prev, message.payload]);
          break;
        case "typing":
          const { userId: typingUserId, isTyping } = message.payload as { userId: string; isTyping: boolean };
          setTypingUsers((prev) =>
            isTyping
              ? [...new Set([...prev, typingUserId])]
              : prev.filter((id) => id !== typingUserId)
          );
          break;
      }
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      send({
        type: "message",
        payload: { content, userId, timestamp: Date.now() },
      });
    },
    [send, userId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      send({
        type: "typing",
        payload: { userId, isTyping },
      });
    },
    [send, userId]
  );

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
  };
}

export function useRealtimeLeaderboard() {
  const [rankings, setRankings] = useState<unknown[]>([]);
  const [rankChanges, setRankChanges] = useState<{ userId: string; oldRank: number; newRank: number }[]>([]);

  const { isConnected } = useWebSocket({
    url: "wss://api.brandforge.gg/leaderboard",
    onMessage: (message) => {
      switch (message.type) {
        case "rankings":
          setRankings(message.payload as unknown[]);
          break;
        case "rank_change":
          const change = message.payload as { userId: string; oldRank: number; newRank: number };
          setRankChanges((prev) => [change, ...prev].slice(0, 10));
          break;
      }
    },
  });

  return {
    isConnected,
    rankings,
    rankChanges,
  };
}

export function useRealtimePresence(roomId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [viewingUsers, setViewingUsers] = useState<string[]>([]);

  const { isConnected, send } = useWebSocket({
    url: `wss://api.brandforge.gg/presence/${roomId}`,
    onMessage: (message) => {
      switch (message.type) {
        case "presence":
          setOnlineUsers(message.payload as string[]);
          break;
        case "viewing":
          setViewingUsers(message.payload as string[]);
          break;
      }
    },
  });

  const updatePresence = useCallback(
    (status: "online" | "away" | "offline") => {
      send({
        type: "presence",
        payload: { status, timestamp: Date.now() },
      });
    },
    [send]
  );

  return {
    isConnected,
    onlineUsers,
    viewingUsers,
    updatePresence,
  };
}
