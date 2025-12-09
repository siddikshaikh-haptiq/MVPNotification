# MVP Notification Location Tracking Server

WebSocket server for receiving and managing real-time location updates from the MVP Notification mobile app.

## Features

- **Real-time Location Updates**: Receives location data via WebSocket (Socket.IO)
- **Session Management**: Tracks active tracking sessions
- **Location History**: Stores location history for each session
- **REST API**: Query sessions and location data via HTTP endpoints
- **Multi-client Support**: Handles multiple concurrent connections
- **Auto-reconnection**: Handles client reconnections gracefully

## Prerequisites

- Node.js >= 20.0.0
- npm or yarn

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (optional):
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   PORT=3000
   CORS_ORIGIN=*
   ```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and connection count.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "activeConnections": 5,
  "activeSessions": 3
}
```

### Get All Sessions
```
GET /sessions
```
Returns all tracking sessions.

**Response:**
```json
{
  "total": 10,
  "active": 3,
  "sessions": [...]
}
```

### Get Session Details
```
GET /sessions/:sessionId
```
Returns detailed information about a specific session including location history.

**Response:**
```json
{
  "userId": "user123",
  "sessionId": "session_1234567890_abc123",
  "startTime": 1234567890000,
  "endTime": 1234567900000,
  "isActive": false,
  "locationCount": 150,
  "lastLocation": {...},
  "locationHistory": [...]
}
```

### Get Session Locations
```
GET /sessions/:sessionId/locations?limit=100&offset=0
```
Returns location history for a session with pagination.

**Query Parameters:**
- `limit`: Number of locations to return (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "total": 150,
  "locations": [...]
}
```

### Get Connected Clients
```
GET /clients
```
Returns information about all connected clients.

**Response:**
```json
{
  "total": 5,
  "clients": [...]
}
```

## WebSocket Events

### Client → Server Events

#### `tracking:start`
Emitted when a client starts tracking.

**Payload:**
```json
{
  "userId": "user123",
  "sessionId": "session_1234567890_abc123"
}
```

#### `location:update`
Emitted on each location update.

**Payload:**
```json
{
  "userId": "user123",
  "sessionId": "session_1234567890_abc123",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 10.5,
    "accuracy": 5.0,
    "altitudeAccuracy": 3.0,
    "heading": 45.0,
    "speed": 2.5,
    "timestamp": 1234567890000
  }
}
```

#### `tracking:stop`
Emitted when a client stops tracking.

**Payload:**
```json
{
  "sessionId": "session_1234567890_abc123"
}
```

### Server → Client Events

#### `tracking:start`
Acknowledgment when tracking starts.

**Payload:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "userId": "user123",
  "startTime": 1234567890000
}
```

#### `location:received`
Acknowledgment when location update is received.

**Payload:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "timestamp": 1234567890000
}
```

#### `tracking:stop`
Acknowledgment when tracking stops.

**Payload:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "endTime": 1234567900000,
  "totalLocations": 150
}
```

#### `tracking:started` (Broadcast)
Broadcasted when any client starts tracking.

#### `location:update` (Broadcast)
Broadcasted location update from any client (for real-time dashboards).

#### `tracking:stopped` (Broadcast)
Broadcasted when any client stops tracking.

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: CORS origin (default: `*`)

### Connection Query Parameters

When connecting to the WebSocket, include these query parameters:

- `userId`: User identifier
- `sessionId`: Session identifier (optional on initial connection)

Example:
```
ws://localhost:3000/?userId=user123&sessionId=session_abc123
```

## Data Storage

Currently, the server uses in-memory storage. For production use, consider:

1. **Database Integration**: Store sessions and locations in a database (PostgreSQL, MongoDB, etc.)
2. **Redis**: Use Redis for session management and real-time data
3. **Time-series Database**: Use InfluxDB or TimescaleDB for location data

## Production Considerations

1. **Authentication**: Add authentication middleware for WebSocket connections
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Database**: Replace in-memory storage with persistent database
4. **Logging**: Use proper logging library (Winston, Pino, etc.)
5. **Monitoring**: Add monitoring and alerting (Prometheus, Grafana)
6. **SSL/TLS**: Use WSS (WebSocket Secure) in production
7. **Load Balancing**: Use multiple server instances with Redis adapter for Socket.IO

## Testing

Test the server using the mobile app or a WebSocket client:

```bash
# Using wscat (install: npm install -g wscat)
wscat -c ws://localhost:3000/?userId=test123&sessionId=test_session

# Then send events:
> {"type":"tracking:start","userId":"test123","sessionId":"test_session"}
> {"type":"location:update","userId":"test123","sessionId":"test_session","location":{"latitude":37.7749,"longitude":-122.4194,"timestamp":1234567890000}}
```

## Troubleshooting

### Port Already in Use
Change the port in `.env` or use a different port:
```bash
PORT=3001 npm run dev
```

### CORS Issues
Update `CORS_ORIGIN` in `.env` to match your client's origin.

### Connection Refused
Ensure the server is running and the port is accessible.

## License

MIT

