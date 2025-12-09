import React, {createContext, useContext, useState, useCallback, useEffect, ReactNode} from 'react';
import {LocationData, TrackingSession} from '@types/index';
import {locationService} from '@services/locationService';
import {socketService} from '@services/socketService';
import {useAuth} from './AuthContext';

interface LocationContextType {
  isTracking: boolean;
  currentLocation: LocationData | null;
  trackingSession: TrackingSession | null;
  startTracking: (useBackground?: boolean) => Promise<boolean>;
  stopTracking: () => Promise<void>;
  locationHistory: LocationData[];
  clearLocationHistory: () => void;
  socketConnected: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({children}) => {
  const {user} = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [trackingSession, setTrackingSession] = useState<TrackingSession | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isTracking) {
        locationService.stopTracking();
        if (trackingSession) {
          socketService.emitTrackingStop(trackingSession.id);
          socketService.disconnect();
        }
      }
    };
  }, [isTracking, trackingSession]);

  const handleLocationUpdate = useCallback(
    (location: LocationData) => {
      setCurrentLocation(location);
      setLocationHistory((prev) => [...prev, location]);

      // Emit to socket if connected and tracking
      if (trackingSession && user && socketService.getConnectionStatus()) {
        socketService.emitLocationUpdate(location, user.id, trackingSession.id);
      }
    },
    [trackingSession, user],
  );

  const startTracking = useCallback(
    async (useBackground: boolean = false): Promise<boolean> => {
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      if (isTracking) {
        console.warn('Tracking already in progress');
        return false;
      }

      try {
        // Create new tracking session
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session: TrackingSession = {
          id: sessionId,
          userId: user.id,
          startTime: new Date().toISOString(),
          isActive: true,
          locations: [],
        };

        setTrackingSession(session);

        // Connect to socket
        try {
          await socketService.connect(user.id, sessionId);
          setSocketConnected(true);
          socketService.emitTrackingStart(user.id, sessionId);
        } catch (error) {
          console.warn('Failed to connect to socket, continuing with local tracking:', error);
          setSocketConnected(false);
        }

        // Start location tracking
        const success = useBackground
          ? await locationService.startBackgroundTracking(handleLocationUpdate, {
              accuracy: undefined, // Use default from ENV
              timeInterval: undefined, // Use default from ENV
              distanceInterval: 10, // 10 meters
              foregroundService: {
                notificationTitle: 'Location Tracking Active',
                notificationBody: 'Your location is being tracked in the background',
              },
            })
          : await locationService.startForegroundTracking(handleLocationUpdate, {
              accuracy: undefined,
              timeInterval: undefined,
              distanceInterval: 10,
            });

        if (success) {
          setIsTracking(true);
          setLocationHistory([]);
          return true;
        } else {
          // Cleanup on failure
          socketService.disconnect();
          setTrackingSession(null);
          return false;
        }
      } catch (error) {
        console.error('Error starting tracking:', error);
        socketService.disconnect();
        setTrackingSession(null);
        return false;
      }
    },
    [user, isTracking, handleLocationUpdate],
  );

  const stopTracking = useCallback(async () => {
    if (!isTracking) {
      return;
    }

    try {
      locationService.stopTracking();

      if (trackingSession) {
        socketService.emitTrackingStop(trackingSession.id);
        setTrackingSession((prev) => {
          if (prev) {
            return {
              ...prev,
              endTime: new Date().toISOString(),
              isActive: false,
            };
          }
          return null;
        });
      }

      socketService.disconnect();
      setSocketConnected(false);
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  }, [isTracking, trackingSession]);

  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
  }, []);

  // Listen to socket connection status changes
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const connected = socketService.getConnectionStatus();
      setSocketConnected(connected);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        isTracking,
        currentLocation,
        trackingSession,
        startTracking,
        stopTracking,
        locationHistory,
        clearLocationHistory,
        socketConnected,
      }}>
      {children}
    </LocationContext.Provider>
  );
};

