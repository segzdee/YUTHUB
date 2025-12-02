import { WebSocketServer } from 'ws';
import { supabase } from './config/supabase.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
  });

  const clients = new Map();

  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection');

    let clientId = null;
    let userId = null;
    let organizationId = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle authentication
        if (data.type === 'auth') {
          const token = data.token;

          if (!token) {
            ws.send(JSON.stringify({ type: 'error', message: 'No token provided' }));
            return;
          }

          // Verify token with Supabase
          const { data: { user }, error } = await supabase.auth.getUser(token);

          if (error || !user) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            ws.close();
            return;
          }

          userId = user.id;

          // Get user's organization
          const { data: userOrg } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          if (userOrg) {
            organizationId = userOrg.organization_id;
            clientId = `${userId}-${Date.now()}`;

            clients.set(clientId, {
              ws,
              userId,
              organizationId,
              connectedAt: new Date(),
            });

            ws.send(JSON.stringify({
              type: 'authenticated',
              clientId,
              message: 'WebSocket authenticated successfully',
            }));

            console.log(`Client authenticated: ${clientId}`);
          }
        }

        // Handle ping
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }

        // Handle subscribe to updates
        if (data.type === 'subscribe') {
          if (!userId || !organizationId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
          }

          ws.send(JSON.stringify({
            type: 'subscribed',
            channel: data.channel || 'default',
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to YUTHUB WebSocket server',
    }));
  });

  // Broadcast function for sending updates
  const broadcast = (organizationId, message) => {
    clients.forEach((client) => {
      if (client.organizationId === organizationId && client.ws.readyState === 1) {
        client.ws.send(JSON.stringify(message));
      }
    });
  };

  // Heartbeat to keep connections alive
  const heartbeat = setInterval(() => {
    clients.forEach((client, clientId) => {
      if (client.ws.readyState === 1) {
        client.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      } else {
        clients.delete(clientId);
      }
    });
  }, 30000); // Every 30 seconds

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  console.log('WebSocket server initialized');

  return { wss, broadcast };
}
