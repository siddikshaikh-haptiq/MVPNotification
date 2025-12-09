# Live Tracking & Background Location via Sockets

This document describes the live tracking and background location feature implementation using WebSockets for real-time communication.

## Overview

The app now supports:
- **Foreground Location Tracking**: Real-time location updates while the app is in the foreground
- **Background Location Tracking**: Continuous location updates even when the app is in the background
- **Real-time Socket Communication**: Location updates are sent to a WebSocket server in real-time
- **Location History**: Track and view location history during active sessions

## Architecture

### Components

1. **LocationService** (`src/services/locationService.ts`)
   - Handles location permissions
   - Manages foreground and background location tracking
   - Converts location data to standardized format

2. **SocketService** (`src/services/socketService.ts`)
   - Manages WebSocket connections
   - Emits location updates to the server
   - Handles reconnection logic

3. **LocationContext** (`src/context/LocationContext.tsx`)
   - Provides location tracking state management
   - Integrates location service with socket service
   - Manages tracking sessions

4. **LiveTrackingScreen** (`src/screens/LiveTrackingScreen.tsx`)
   - UI for starting/stopping tracking
   - Displays current location and statistics
   - Shows location history

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
SOCKET_URL=ws://your-socket-server.com
LOCATION_UPDATE_INTERVAL=5000
LOCATION_ACCURACY=balanced
```

- `SOCKET_URL`: WebSocket server URL (default: `ws://localhost:3000`)
- `LOCATION_UPDATE_INTERVAL`: Update interval in milliseconds (default: 5000ms)
- `LOCATION_ACCURACY`: Location accuracy level - `highest`, `high`, `balanced`, `low`, `lowest` (default: `balanced`)

### Permissions

#### Android

Permissions are automatically configured in `AndroidManifest.xml`:
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`

#### iOS

Permissions are configured in `app.json`:
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- Background modes: `location` and `fetch`

## Usage

### Starting Tracking

```typescript
import {useLocation} from '@context/LocationContext';

const {startTracking} = useLocation();

// Start foreground tracking
await startTracking(false);

// Start background tracking
await startTracking(true);
```

### Stopping Tracking

```typescript
const {stopTracking} = useLocation();
await stopTracking();
```

### Accessing Location Data

```typescript
const {
  isTracking,
  currentLocation,
  trackingSession,
  locationHistory,
  socketConnected,
} = useLocation();
```

## Socket Server Protocol

### Client → Server Events

#### `tracking:start`
Emitted when tracking starts.

```json
{
  "userId": "user123",
  "sessionId": "session_1234567890_abc123"
}
```

#### `tracking:stop`
Emitted when tracking stops.

```json
{
  "sessionId": "session_1234567890_abc123"
}
```

#### `location:update`
Emitted on each location update.

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

### Server → Client Events

#### `tracking:start`
Acknowledgment when tracking starts.

#### `tracking:stop`
Acknowledgment when tracking stops.

#### `location:update`
Broadcast location update from another user (optional).

## Background Tracking

### Android

Background tracking requires:
1. `ACCESS_BACKGROUND_LOCATION` permission (Android 10+)
2. Foreground service notification
3. User must grant "Allow all the time" location permission

### iOS

Background tracking requires:
1. `NSLocationAlwaysAndWhenInUseUsageDescription` permission
2. Background modes enabled in `Info.plist`
3. User must grant "Always" location permission

## Best Practices

1. **Battery Optimization**: Use appropriate update intervals and distance thresholds
2. **Privacy**: Always request permissions with clear explanations
3. **Error Handling**: Handle permission denials gracefully
4. **Socket Reconnection**: The service automatically handles reconnection attempts
5. **Data Usage**: Consider compressing location data for high-frequency updates

## Troubleshooting

### Location not updating
- Check location permissions in device settings
- Verify location services are enabled
- Check if battery optimization is affecting the app

### Socket not connecting
- Verify `SOCKET_URL` is correct
- Check network connectivity
- Ensure socket server is running and accessible

### Background tracking not working
- Verify background location permission is granted
- Check if device has battery optimization enabled
- On Android, ensure foreground service notification is visible

## Testing

1. **Foreground Tracking**: Start tracking and move around while app is open
2. **Background Tracking**: Start background tracking, minimize app, and move around
3. **Socket Connection**: Monitor socket connection status in the UI
4. **Permission Handling**: Test with permissions denied/granted scenarios

## Notes

- Location updates are stored in memory during the session
- Location history is cleared when tracking stops
- Socket connection is automatically managed
- Background tracking may have limitations on some devices due to battery optimization

