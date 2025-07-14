import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useDashboardStore } from '@/store/dashboardStore';

interface WebSocketMessage {
  type: 'update' | 'notification' | 'metric_change' | 'incident_alert' | 'connection_established' | 'pong';
  data: any;
  timestamp: string;
  clientId?: string;
}

// Global connection manager to prevent multiple connections per user
class WebSocketConnectionManager {
  private static instance: WebSocketConnectionManager;
  private connections = new Map<string, {
    ws: WebSocket;
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    listeners: Set<(message: WebSocketMessage) => void>;
    reconnectAttempts: number;
    reconnectTimeout?: NodeJS.Timeout;
    lastActivity: number;
    heartbeatInterval?: NodeJS.Timeout;
  }>();

  static getInstance(): WebSocketConnectionManager {
    if (!WebSocketConnectionManager.instance) {
      WebSocketConnectionManager.instance = new WebSocketConnectionManager();
    }
    return WebSocketConnectionManager.instance;
  }

  private getExponentialBackoffDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  private startHeartbeat(userId: string) {
    const connection = this.connections.get(userId);
    if (!connection) return;

    // Clear any existing heartbeat
    if (connection.heartbeatInterval) {
      clearInterval(connection.heartbeatInterval);
    }

    connection.heartbeatInterval = setInterval(() => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify({ type: 'ping' }));
        connection.lastActivity = Date.now();
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(userId: string) {
    const connection = this.connections.get(userId);
    if (connection?.heartbeatInterval) {
      clearInterval(connection.heartbeatInterval);
      connection.heartbeatInterval = undefined;
    }
  }

  private attemptReconnect(userId: string, userRole: string) {
    const connection = this.connections.get(userId);
    if (!connection) return;

    // Clear any existing timeout
    if (connection.reconnectTimeout) {
      clearTimeout(connection.reconnectTimeout);
    }

    const delay = this.getExponentialBackoffDelay(connection.reconnectAttempts);
    console.log(`WebSocket reconnection attempt ${connection.reconnectAttempts + 1} in ${delay}ms`);

    connection.reconnectTimeout = setTimeout(() => {
      connection.reconnectAttempts++;
      this.connect(userId, userRole);
    }, delay);
  }

  connect(userId: string, userRole: string): void {
    // If already connecting or connected, don't create new connection
    const existing = this.connections.get(userId);
    if (existing && (existing.status === 'connecting' || existing.status === 'connected')) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      
      const connection = {
        ws,
        status: 'connecting' as const,
        listeners: existing?.listeners || new Set(),
        reconnectAttempts: existing?.reconnectAttempts || 0,
        lastActivity: Date.now(),
      };

      this.connections.set(userId, connection);

      // Notify listeners about status change
      connection.listeners.forEach(listener => {
        listener({ type: 'notification', data: { status: 'connecting' }, timestamp: new Date().toISOString() });
      });

      ws.onopen = () => {
        connection.status = 'connected';
        connection.reconnectAttempts = 0; // Reset on successful connection
        console.log(`WebSocket connected for user ${userId}`);
        
        // Send authentication info
        ws.send(JSON.stringify({
          type: 'auth',
          userId,
          role: userRole,
        }));

        // Start heartbeat
        this.startHeartbeat(userId);

        // Notify listeners about successful connection
        connection.listeners.forEach(listener => {
          listener({ type: 'notification', data: { status: 'connected' }, timestamp: new Date().toISOString() });
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          connection.lastActivity = Date.now();
          
          // Broadcast to all listeners
          connection.listeners.forEach(listener => {
            listener(message);
          });
        } catch (error) {
          console.error('WebSocket message parsing error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            rawMessage: event.data,
            timestamp: new Date().toISOString(),
          });
        }
      };

      ws.onclose = (event) => {
        connection.status = 'disconnected';
        this.stopHeartbeat(userId);
        
        console.log(`WebSocket disconnected for user ${userId}:`, event.code, event.reason);
        
        // Notify listeners about disconnection
        connection.listeners.forEach(listener => {
          listener({ type: 'notification', data: { status: 'disconnected' }, timestamp: new Date().toISOString() });
        });

        // Only attempt reconnection if it wasn't a clean close (code 1000)
        if (event.code !== 1000 && connection.reconnectAttempts < 5) {
          this.attemptReconnect(userId, userRole);
        }
      };

      ws.onerror = (error) => {
        connection.status = 'error';
        this.stopHeartbeat(userId);
        
        console.error('WebSocket connection error:', {
          error: error instanceof Error ? error.message : 'Connection failed',
          url: wsUrl,
          timestamp: new Date().toISOString(),
        });

        // Notify listeners about error
        connection.listeners.forEach(listener => {
          listener({ type: 'notification', data: { status: 'error' }, timestamp: new Date().toISOString() });
        });
      };

    } catch (error) {
      console.error('WebSocket connection creation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: wsUrl,
        timestamp: new Date().toISOString(),
      });
    }
  }

  addListener(userId: string, listener: (message: WebSocketMessage) => void): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.listeners.add(listener);
    }
  }

  removeListener(userId: string, listener: (message: WebSocketMessage) => void): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.listeners.delete(listener);
      
      // If no more listeners, close the connection
      if (connection.listeners.size === 0) {
        this.disconnect(userId);
      }
    }
  }

  disconnect(userId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      this.stopHeartbeat(userId);
      
      if (connection.reconnectTimeout) {
        clearTimeout(connection.reconnectTimeout);
      }
      
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close(1000, 'Component unmounted');
      }
      
      this.connections.delete(userId);
    }
  }

  getStatus(userId: string): 'connecting' | 'connected' | 'disconnected' | 'error' {
    const connection = this.connections.get(userId);
    return connection?.status || 'disconnected';
  }

  sendMessage(userId: string, message: any): void {
    const connection = this.connections.get(userId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }
}

export function useOptimizedWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useDashboardStore();
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const mounted = useRef(true);
  const manager = useRef(WebSocketConnectionManager.getInstance());

  // Message handler
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (!mounted.current) return;

    setLastMessage(message);
    
    // Update connection status from internal messages
    if (message.type === 'notification' && message.data.status) {
      setConnectionStatus(message.data.status);
      return;
    }

    switch (message.type) {
      case 'update':
        // Invalidate relevant queries based on the update type
        if (message.data.entityType) {
          queryClient.invalidateQueries({ 
            queryKey: [`/api/${message.data.entityType}`] 
          });
        }
        break;
      
      case 'metric_change':
        // Update dashboard metrics
        queryClient.invalidateQueries({ 
          queryKey: ['/api/dashboard/metrics'] 
        });
        break;
      
      case 'incident_alert':
        // High priority alert - show desktop notification if enabled
        if (notifications.enabled && notifications.desktop) {
          if (Notification.permission === 'granted') {
            new Notification('YUTHUB - Incident Alert', {
              body: message.data.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
        break;
      
      case 'notification':
        // Standard notification
        if (notifications.enabled && message.data.status !== 'connecting' && message.data.status !== 'connected' && message.data.status !== 'disconnected' && message.data.status !== 'error') {
          // Handle other notification types
          console.log('Received notification:', message.data);
        }
        break;
    }
  }, [queryClient, notifications, mounted]);

  useEffect(() => {
    mounted.current = true;
    
    if (!isAuthenticated || !user) {
      setConnectionStatus('disconnected');
      return;
    }

    const userId = user.id;
    const userRole = user.role;

    // Add message listener
    manager.current.addListener(userId, handleMessage);
    
    // Connect if not already connected
    if (manager.current.getStatus(userId) === 'disconnected') {
      manager.current.connect(userId, userRole);
    }

    // Set initial status
    setConnectionStatus(manager.current.getStatus(userId));

    return () => {
      mounted.current = false;
      if (userId) {
        manager.current.removeListener(userId, handleMessage);
      }
    };
  }, [isAuthenticated, user, handleMessage]);

  const sendMessage = useCallback((message: any) => {
    if (user?.id) {
      manager.current.sendMessage(user.id, message);
    }
  }, [user?.id]);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    isConnected: connectionStatus === 'connected',
  };
}