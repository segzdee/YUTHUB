import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { parse } from 'url';
import { storage } from './storage';

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  role?: string;
  lastActivity: Date;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ConnectedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupEventHandlers();
    this.startHeartbeat();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      const client: ConnectedClient = {
        ws,
        lastActivity: new Date(),
      };

      this.clients.set(clientId, client);
      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        clientId,
        timestamp: new Date().toISOString(),
      }));
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    switch (message.type) {
      case 'auth':
        client.userId = message.userId;
        client.role = message.role;
        console.log(`Client ${clientId} authenticated as ${message.userId} with role ${message.role}`);
        break;

      case 'subscribe':
        // Handle subscription to specific data types
        this.handleSubscription(clientId, message.data);
        break;

      case 'ping':
        // Respond to ping with pong
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
    }
  }

  private handleSubscription(clientId: string, subscriptionData: any) {
    // This could be used for selective notifications based on user preferences
    console.log(`Client ${clientId} subscribed to:`, subscriptionData);
  }

  private generateClientId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      
      this.clients.forEach((client, clientId) => {
        // Check if client is still responsive (last activity within 60 seconds)
        if (now.getTime() - client.lastActivity.getTime() > 60000) {
          console.log(`Removing inactive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
        } else {
          // Send ping to check if client is still alive
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ type: 'ping', timestamp: now.toISOString() }));
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // Public methods for broadcasting updates
  public broadcastUpdate(entityType: string, action: string, data: any) {
    const message = {
      type: 'update',
      data: { entityType, action, data },
      timestamp: new Date().toISOString(),
    };

    this.broadcast(message);
  }

  public broadcastMetricChange(metrics: any) {
    const message = {
      type: 'metric_change',
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    this.broadcast(message);
  }

  public broadcastIncidentAlert(incident: any) {
    const message = {
      type: 'incident_alert',
      data: {
        message: `New ${incident.priority} priority incident: ${incident.title}`,
        incident,
      },
      timestamp: new Date().toISOString(),
    };

    // Only send to users with appropriate permissions
    this.broadcastToRoles(message, ['admin', 'manager', 'support_coordinator', 'safeguarding_officer']);
  }

  public broadcastNotification(notification: any, targetRoles?: string[]) {
    const message = {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    if (targetRoles) {
      this.broadcastToRoles(message, targetRoles);
    } else {
      this.broadcast(message);
    }
  }

  private broadcast(message: any) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private broadcastToRoles(message: any, roles: string[]) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.role && roles.includes(client.role)) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getClientsByRole(role: string): number {
    return Array.from(this.clients.values()).filter(client => client.role === role).length;
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.clear();
    this.wss.close();
  }
}

export let wsManager: WebSocketManager;

export function setupWebSocket(server: Server) {
  wsManager = new WebSocketManager(server);
  return wsManager;
}