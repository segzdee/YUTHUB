import { Server } from 'socket.io';
import { supabase } from './config/supabase.js';

let io = null;

/**
 * Initialize Socket.IO server with JWT authentication
 */
export function setupWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.VITE_APP_URL || 'http://localhost:5000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error('Invalid authentication token'));
      }

      // Get user's organization
      const { data: userOrg, error: orgError } = await supabase
        .from('user_organizations')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (orgError || !userOrg) {
        return next(new Error('No active organization found'));
      }

      // Attach user info to socket
      socket.userId = user.id;
      socket.organizationId = userOrg.organization_id;
      socket.userRole = userOrg.role;
      socket.userEmail = user.email;

      next();
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const orgRoom = `org:${socket.organizationId}`;

    console.log(`User ${socket.userId} connected to ${orgRoom}`);

    // Join organization-specific room
    socket.join(orgRoom);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to YUTHUB WebSocket server',
      organizationId: socket.organizationId,
      userId: socket.userId,
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from ${orgRoom}`);
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('WebSocket server initialized');
  return io;
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return null;
  }
  return io;
}

/**
 * Emit event to organization room
 */
export function emitToOrganization(organizationId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  const room = `org:${organizationId}`;
  io.to(room).emit(event, data);
}

/**
 * Real-time event emitters
 */
export function emitResidentCreated(organizationId, resident) {
  emitToOrganization(organizationId, 'resident:created', { action: 'created', resident, timestamp: new Date().toISOString() });
}

export function emitResidentUpdated(organizationId, resident) {
  emitToOrganization(organizationId, 'resident:updated', { action: 'updated', resident, timestamp: new Date().toISOString() });
}

export function emitIncidentReported(organizationId, incident) {
  emitToOrganization(organizationId, 'incident:reported', { action: 'reported', incident, timestamp: new Date().toISOString() });
}

export function emitIncidentEscalated(organizationId, incident) {
  emitToOrganization(organizationId, 'incident:escalated', { action: 'escalated', incident, severity: 'critical', timestamp: new Date().toISOString() });
}

export function emitSafeguardingAlert(organizationId, concern) {
  emitToOrganization(organizationId, 'safeguarding:alert', { action: 'alert', concern, severity: 'critical', timestamp: new Date().toISOString() });
}

export function emitOccupancyUpdated(organizationId, property) {
  emitToOrganization(organizationId, 'occupancy:updated', { action: 'updated', property, timestamp: new Date().toISOString() });
}

export function emitGoalCompleted(organizationId, goal) {
  emitToOrganization(organizationId, 'goal:completed', { action: 'completed', goal, timestamp: new Date().toISOString() });
}

export function emitMetricsRefresh(organizationId) {
  emitToOrganization(organizationId, 'metrics:refresh', { action: 'refresh', timestamp: new Date().toISOString() });
}

export function emitSupportPlanReviewDue(organizationId, plan) {
  emitToOrganization(organizationId, 'support_plan:review_due', { action: 'review_due', plan, timestamp: new Date().toISOString() });
}

export function emitDocumentExpiring(organizationId, document) {
  emitToOrganization(organizationId, 'document:expiring', { action: 'expiring', document, timestamp: new Date().toISOString() });
}
