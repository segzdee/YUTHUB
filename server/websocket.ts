import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { PlatformDataAggregator } from './platformAdminAggregation';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private dataRefreshInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false,
      maxPayload: 1024 * 1024 // 1MB max payload
    });

    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`🔌 WebSocket client connected: ${clientId}`);

      // Send initial data
      this.sendInitialData(ws);

      // Handle client messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleClientMessage(clientId, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    // Start periodic data refresh
    this.startDataRefresh();
  }

  private generateClientId(): string {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const [overview, realTimeMetrics] = await Promise.all([
        PlatformDataAggregator.getPlatformOverview(),
        PlatformDataAggregator.getRealTimeMetrics()
      ]);

      const initialData = {
        type: 'initial_data',
        data: {
          overview,
          realTimeMetrics,
          timestamp: new Date().toISOString()
        }
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(initialData));
      }
    } catch (error) {
      console.error('Error sending initial WebSocket data:', error);
    }
  }

  private async handleClientMessage(clientId: string, message: any) {
    const ws = this.clients.get(clientId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;

      case 'request_data':
        await this.sendRequestedData(ws, message.dataType, message.params);
        break;

      case 'subscribe_updates':
        // Subscribe to specific data updates
        await this.subscribeToUpdates(clientId, message.subscriptions);
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private async sendRequestedData(ws: WebSocket, dataType: string, params: any = {}) {
    try {
      let data;

      switch (dataType) {
        case 'overview':
          data = await PlatformDataAggregator.getPlatformOverview();
          break;

        case 'organization_breakdowns':
          data = await PlatformDataAggregator.getOrganizationBreakdowns(params.timeRange);
          break;

        case 'historical_trends':
          data = await PlatformDataAggregator.getHistoricalTrends(params.months);
          break;

        case 'real_time_metrics':
          data = await PlatformDataAggregator.getRealTimeMetrics();
          break;

        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      const response = {
        type: 'data_response',
        dataType,
        data,
        timestamp: new Date().toISOString()
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(response));
      }
    } catch (error) {
      console.error('Error sending requested data:', error);
      
      const errorResponse = {
        type: 'error',
        message: 'Failed to fetch requested data',
        timestamp: new Date().toISOString()
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(errorResponse));
      }
    }
  }

  private async subscribeToUpdates(clientId: string, subscriptions: string[]) {
    // Store subscription preferences for this client
    // This would be implemented with a client subscription tracking system
    console.log(`Client ${clientId} subscribed to:`, subscriptions);
  }

  private startDataRefresh() {
    // Refresh data every 30 seconds
    this.dataRefreshInterval = setInterval(async () => {
      await this.broadcastUpdates();
    }, 30000);
  }

  private async broadcastUpdates() {
    if (this.clients.size === 0) {
      return;
    }

    try {
      const [overview, realTimeMetrics] = await Promise.all([
        PlatformDataAggregator.getPlatformOverview(),
        PlatformDataAggregator.getRealTimeMetrics()
      ]);

      const updateData = {
        type: 'data_update',
        data: {
          overview,
          realTimeMetrics,
          timestamp: new Date().toISOString()
        }
      };

      this.broadcast(updateData);
    } catch (error) {
      console.error('Error broadcasting updates:', error);
    }
  }

  broadcast(data: any) {
    const message = JSON.stringify(data);
    
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error(`Error sending to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      } else {
        // Remove dead connections
        this.clients.delete(clientId);
      }
    });
  }

  // Platform admin specific methods
  async broadcastPlatformUpdate(updateType: string, data: any) {
    const message = {
      type: 'platform_update',
      updateType,
      data,
      timestamp: new Date().toISOString()
    };

    this.broadcast(message);
  }

  async broadcastOrganizationUpdate(organizationId: number, updateType: string, data: any) {
    const message = {
      type: 'organization_update',
      organizationId,
      updateType,
      data,
      timestamp: new Date().toISOString()
    };

    this.broadcast(message);
  }

  broadcastToRoles(roles: string[], message: any) {
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        // For now, broadcast to all connected clients
        // In a full implementation, you'd check user roles from session
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      } else {
        this.clients.delete(clientId);
      }
    });
  }

  async broadcastSystemAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string, data?: any) {
    const alert = {
      type: 'system_alert',
      severity,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    this.broadcast(alert);
  }

  // Manual data refresh trigger
  async triggerDataRefresh() {
    await this.broadcastUpdates();
  }

  // Cleanup method
  shutdown() {
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    this.clients.clear();

    if (this.wss) {
      this.wss.close();
    }
  }

  // Get connection statistics
  getStats() {
    return {
      connectedClients: this.clients.size,
      serverRunning: this.wss !== null,
      dataRefreshActive: this.dataRefreshInterval !== null
    };
  }
}

export default WebSocketManager;