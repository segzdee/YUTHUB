import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useDashboardStore } from '@/store/dashboardStore';

interface WebSocketMessage {
  type: 'update' | 'notification' | 'metric_change' | 'incident_alert';
  data: any;
  timestamp: string;
}

// Legacy hook - deprecated, use useOptimizedWebSocket instead
export function useWebSocketConnection() {
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useDashboardStore();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      try {
        setConnectionStatus('connecting');
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          setConnectionStatus('connected');
          console.log('WebSocket connected for real-time updates');
          
          // Send authentication info
          if (ws.current) {
            ws.current.send(JSON.stringify({
              type: 'auth',
              userId: user.id,
              role: user.role,
            }));
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            
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
                if (notifications.enabled) {
                  // Could trigger a toast notification or update notification center
                  // New notification received: ${message.data}
                }
                break;
            }
          } catch (error) {
            // Log WebSocket message parsing errors in development
            if (process.env.NODE_ENV === 'development') {
              console.error('WebSocket message parsing error:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                rawMessage: event.data,
                timestamp: new Date().toISOString(),
              });
            }
          }
        };

        ws.current.onclose = () => {
          setConnectionStatus('disconnected');
          console.log('WebSocket disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        ws.current.onerror = (error) => {
          setConnectionStatus('error');
          // Log WebSocket connection errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error('WebSocket connection error:', {
              error: error instanceof Error ? error.message : 'Connection failed',
              url: url,
              timestamp: new Date().toISOString(),
            });
          }
        };
      } catch (error) {
        setConnectionStatus('error');
        console.error('WebSocket connection creation failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: url,
          timestamp: new Date().toISOString(),
        });
      }
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isAuthenticated, user, queryClient, notifications]);

  const sendMessage = (message: any) => {
    if (ws.current && connectionStatus === 'connected') {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    isConnected: connectionStatus === 'connected',
  };
}