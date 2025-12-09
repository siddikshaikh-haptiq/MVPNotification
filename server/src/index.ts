import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  LocationData,
  SocketLocationUpdate,
  TrackingSession,
  ClientInfo,
} from './types';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO server
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// In-memory storage (in production, use a database)
const activeSessions = new Map<string, TrackingSession>();
const clients = new Map<string, ClientInfo>();
const locationHistory = new Map<string, LocationData[]>();

// Helper function to get or create session
function getOrCreateSession(
  userId: string,
  sessionId: string,
): TrackingSession {
  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, {
      userId,
      sessionId,
      startTime: Date.now(),
      isActive: true,
      locationCount: 0,
    });
    locationHistory.set(sessionId, []);
  }
  return activeSessions.get(sessionId)!;
}

// Helper function to log location update
function logLocationUpdate(update: SocketLocationUpdate): void {
  const {userId, sessionId, location} = update;
  const session = getOrCreateSession(userId, sessionId);

  session.locationCount++;
  session.lastLocation = location;

  // Store location in history
  const history = locationHistory.get(sessionId) || [];
  history.push(location);
  locationHistory.set(sessionId, history);

  // Log to console (in production, save to database)
  console.log(
    `[${new Date().toISOString()}] Location Update - User: ${userId}, Session: ${sessionId}`,
  );
  console.log(
    `  Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
  );
  if (location.accuracy !== null) {
    console.log(`  Accuracy: ${location.accuracy.toFixed(1)}m`);
  }
  if (location.speed !== null) {
    console.log(`  Speed: ${(location.speed * 3.6).toFixed(1)} km/h`);
  }
  console.log(`  Total Updates: ${session.locationCount}`);
}

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  const clientId = socket.id;
  const query = socket.handshake.query;
  const userId = (query.userId as string) || 'unknown';
  const sessionId = (query.sessionId as string) || '';

  console.log(
    `[${new Date().toISOString()}] Client connected - Socket ID: ${clientId}, User: ${userId}`,
  );

  // Store client info
  clients.set(clientId, {
    socketId: clientId,
    userId,
    sessionId,
    connectedAt: Date.now(),
  });

  // Handle tracking start
  socket.on('tracking:start', (data: {userId: string; sessionId: string}) => {
    const {userId: eventUserId, sessionId: eventSessionId} = data;
    const session = getOrCreateSession(eventUserId, eventSessionId);

    // Update client info
    const client = clients.get(clientId);
    if (client) {
      client.sessionId = eventSessionId;
      clients.set(clientId, client);
    }

    console.log(
      `[${new Date().toISOString()}] Tracking started - User: ${eventUserId}, Session: ${eventSessionId}`,
    );

    // Acknowledge to client
    socket.emit('tracking:start', {
      sessionId: eventSessionId,
      userId: eventUserId,
      startTime: session.startTime,
    });

    // Broadcast to other clients (optional - for multi-user tracking)
    socket.broadcast.emit('tracking:started', {
      userId: eventUserId,
      sessionId: eventSessionId,
    });
  });

  // Handle location updates
  socket.on('location:update', (update: SocketLocationUpdate) => {
    logLocationUpdate(update);

    // Acknowledge receipt
    socket.emit('location:received', {
      sessionId: update.sessionId,
      timestamp: Date.now(),
    });

    // Broadcast to other clients (optional - for real-time tracking dashboard)
    socket.broadcast.emit('location:update', update);
  });

  // Handle tracking stop
  socket.on('tracking:stop', (data: {sessionId: string}) => {
    const {sessionId} = data;
    const session = activeSessions.get(sessionId);

    if (session) {
      session.isActive = false;
      session.endTime = Date.now();

      console.log(
        `[${new Date().toISOString()}] Tracking stopped - Session: ${sessionId}`,
      );
      console.log(
        `  Duration: ${((session.endTime - session.startTime) / 1000 / 60).toFixed(2)} minutes`,
      );
      console.log(`  Total Locations: ${session.locationCount}`);

      // Acknowledge to client
      socket.emit('tracking:stop', {
        sessionId,
        endTime: session.endTime,
        totalLocations: session.locationCount,
      });

      // Broadcast to other clients
      socket.broadcast.emit('tracking:stopped', {
        userId: session.userId,
        sessionId,
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason: string) => {
    console.log(
      `[${new Date().toISOString()}] Client disconnected - Socket ID: ${clientId}, Reason: ${reason}`,
    );

    const client = clients.get(clientId);
    if (client && client.sessionId) {
      const session = activeSessions.get(client.sessionId);
      if (session && session.isActive) {
        // Mark session as inactive but don't delete it
        session.isActive = false;
        session.endTime = Date.now();
        console.log(
          `  Session ${client.sessionId} marked as inactive due to disconnect`,
        );
      }
    }

    clients.delete(clientId);
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    console.error(
      `[${new Date().toISOString()}] Socket error - Socket ID: ${clientId}:`,
      error,
    );
  });
});

// REST API endpoints for querying data
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeConnections: io.sockets.sockets.size,
    activeSessions: Array.from(activeSessions.values()).filter(
      (s) => s.isActive,
    ).length,
  });
});

app.get('/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.values());
  res.json({
    total: sessions.length,
    active: sessions.filter((s) => s.isActive).length,
    sessions: sessions.map((session) => ({
      ...session,
      locationHistory: locationHistory.get(session.sessionId)?.length || 0,
    })),
  });
});

app.get('/sessions/:sessionId', (req, res) => {
  const {sessionId} = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({error: 'Session not found'});
  }

  res.json({
    ...session,
    locationHistory: locationHistory.get(sessionId) || [],
  });
});

app.get('/sessions/:sessionId/locations', (req, res) => {
  const {sessionId} = req.params;
  const history = locationHistory.get(sessionId);

  if (!history) {
    return res.status(404).json({error: 'Session not found'});
  }

  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  res.json({
    sessionId,
    total: history.length,
    locations: history.slice(offset, offset + limit),
  });
});

app.get('/clients', (req, res) => {
  res.json({
    total: clients.size,
    clients: Array.from(clients.values()),
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   MVP Notification Location Tracking Server              ║
║                                                           ║
║   Server running on: http://localhost:${port}                    ║
║   WebSocket endpoint: ws://localhost:${port}                    ║
║                                                           ║
║   Health check: http://localhost:${port}/health          ║
║   Sessions API: http://localhost:${port}/sessions        ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

