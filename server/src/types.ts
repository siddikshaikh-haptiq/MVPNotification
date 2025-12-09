export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface SocketLocationUpdate {
  userId: string;
  sessionId: string;
  location: LocationData;
}

export interface TrackingSession {
  userId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  locationCount: number;
  lastLocation?: LocationData;
}

export interface ClientInfo {
  socketId: string;
  userId: string;
  sessionId?: string;
  connectedAt: number;
}

