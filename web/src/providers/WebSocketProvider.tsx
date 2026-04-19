"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthProvider";

interface WebSocketContextType {
  isConnected: boolean;
  lastPing: number | null;
  latency: number;
  subscribe: (channel: string, callback: (data: unknown) => void) => () => void;
  publish: (channel: string, data: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [latency, setLatency] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to a channel
  const subscribe = useCallback((channel: string, callback: (data: unknown) => void) => {
    if (!subscribersRef.current.has(channel)) {
      subscribersRef.current.set(channel, new Set());
    }
    
    const channelSubscribers = subscribersRef.current.get(channel)!;
    channelSubscribers.add(callback);

    // Subscribe message to server
    wsRef.current?.send(JSON.stringify({ type: "subscribe", channel }));

    // Return unsubscribe function
    return () => {
      channelSubscribers.delete(callback);
      if (channelSubscribers.size === 0) {
        wsRef.current?.send(JSON.stringify({ type: "unsubscribe", channel }));
      }
    };
  }, []);

  // Publish to a channel
  const publish = useCallback((channel: string, data: unknown) => {
    wsRef.current?.send(JSON.stringify({
      type: "publish",
      channel,
      payload: data,
      timestamp: Date.now(),
    }));
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!session?.access_token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "wss://api.brandforge.gg"}?token=${session.access_token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        
        // Subscribe to all previously subscribed channels
        subscribersRef.current.forEach((_, channel) => {
          ws.send(JSON.stringify({ type: "subscribe", channel }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "pong":
              setLastPing(Date.now());
              setLatency(Date.now() - message.timestamp);
              break;
              
            case "publish":
              // Broadcast to all subscribers of this channel
              const channelSubscribers = subscribersRef.current.get(message.channel);
              if (channelSubscribers) {
                channelSubscribers.forEach((callback) => {
                  try {
                    callback(message.payload);
                  } catch (error) {
                    console.error("Error in subscriber callback:", error);
                  }
                });
              }
              break;
              
            case "system":
              console.log("WebSocket system message:", message.payload);
              break;
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt reconnection after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [session?.access_token]);

  // Ping-pong for connection health
  useEffect(() => {
    if (!isConnected) return;

    pingIntervalRef.current = setInterval(() => {
      wsRef.current?.send(JSON.stringify({
        type: "ping",
        timestamp: Date.now(),
      }));
    }, 30000); // Every 30 seconds

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Connect when authenticated
  useEffect(() => {
    if (session?.access_token) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [session?.access_token, connect]);

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConnected, connect]);

  const value: WebSocketContextType = {
    isConnected,
    lastPing,
    latency,
    subscribe,
    publish,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Helper hook for specific channel subscriptions
export function useChannel(channel: string, callback: (data: unknown) => void) {
  const { subscribe, isConnected } = useWebSocketContext();

  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = subscribe(channel, callback);
    return () => {
      unsubscribe();
    };
  }, [channel, callback, subscribe, isConnected]);
}
