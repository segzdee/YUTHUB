import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

interface WebSocketHookOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketEvent {
  action: string;
  [key: string]: any;
  timestamp: string;
}

/**
 * useWebSocket Hook
 *
 * Connects to Socket.IO server with JWT authentication,
 * joins organization-specific rooms, and invalidates React Query caches on data changes
 *
 * @example
 * const { connected, emit } = useWebSocket();
 */
export function useWebSocket(options: WebSocketHookOptions = {}) {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      return;
    }

    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.warn('No access token available for WebSocket connection');
      return;
    }

    const socket = io(import.meta.env.VITE_APP_URL || 'http://localhost:5000', {
      auth: {
        token: session.access_token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onError?.(error);
    });

    socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    // Real-time event listeners with cache invalidation

    // Resident events
    socket.on('resident:created', (event: WebSocketEvent) => {
      console.log('Resident created:', event);
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    });

    socket.on('resident:updated', (event: WebSocketEvent) => {
      console.log('Resident updated:', event);
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['residents', event.resident?.id] });
    });

    // Incident events
    socket.on('incident:reported', (event: WebSocketEvent) => {
      console.log('Incident reported:', event);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });

      // Show notification for critical incidents
      if (event.incident?.severity === 'critical') {
        showNotification('Critical Incident Reported', event.incident.title);
      }
    });

    socket.on('incident:escalated', (event: WebSocketEvent) => {
      console.log('Incident escalated:', event);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
      showNotification('Incident Escalated', 'A critical incident requires immediate attention');
    });

    // Safeguarding events
    socket.on('safeguarding:alert', (event: WebSocketEvent) => {
      console.log('Safeguarding alert:', event);
      queryClient.invalidateQueries({ queryKey: ['safeguarding'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
      showNotification('Safeguarding Alert', 'New safeguarding concern reported');
    });

    // Occupancy events
    socket.on('occupancy:updated', (event: WebSocketEvent) => {
      console.log('Occupancy updated:', event);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    });

    // Goal events
    socket.on('goal:completed', (event: WebSocketEvent) => {
      console.log('Goal completed:', event);
      queryClient.invalidateQueries({ queryKey: ['support-plans'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    });

    // Metrics refresh
    socket.on('metrics:refresh', (event: WebSocketEvent) => {
      console.log('Metrics refresh requested:', event);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Support plan events
    socket.on('support_plan:review_due', (event: WebSocketEvent) => {
      console.log('Support plan review due:', event);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
      showNotification('Support Plan Review Due', 'A support plan requires review');
    });

    // Document events
    socket.on('document:expiring', (event: WebSocketEvent) => {
      console.log('Document expiring:', event);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
      showNotification('Document Expiring', 'A compliance document is expiring soon');
    });

    socketRef.current = socket;
  }, [queryClient, onConnect, onDisconnect, onError]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  /**
   * Emit event to server
   */
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected');
    }
  }, []);

  /**
   * Send ping to check connection
   */
  const ping = useCallback(() => {
    emit('ping');
  }, [emit]);

  // Auto-connect on mount if user is authenticated
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

  return {
    connected: socketRef.current?.connected ?? false,
    connect,
    disconnect,
    emit,
    ping,
    socket: socketRef.current,
  };
}

/**
 * Show browser notification
 */
function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }
}

/**
 * Request notification permission
 */
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
  }
}
