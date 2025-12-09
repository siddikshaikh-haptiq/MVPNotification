import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {LocationData} from '@types/index';
import {ENV} from '@config/env';

const LOCATION_TASK_NAME = 'background-location-task';

export interface LocationTrackingOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
  foregroundService?: {
    notificationTitle: string;
    notificationBody: string;
  };
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private currentLocation: LocationData | null = null;
  private locationCallback: ((location: LocationData) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const {status: foregroundStatus} =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.error('Foreground location permission not granted');
        return false;
      }

      const {status: backgroundStatus} =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted');
        // Continue with foreground tracking
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    try {
      const foregroundStatus =
        await Location.getForegroundPermissionsAsync();
      const backgroundStatus =
        await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus.granted,
        background: backgroundStatus.granted,
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return {foreground: false, background: false};
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return this.convertToLocationData(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  startForegroundTracking(
    callback: (location: LocationData) => void,
    options?: LocationTrackingOptions,
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          resolve(false);
          return;
        }

        this.locationCallback = callback;
        this.isTracking = true;

        const accuracy = this.getAccuracy(options?.accuracy);
        const timeInterval = options?.timeInterval || ENV.LOCATION_UPDATE_INTERVAL;
        const distanceInterval = options?.distanceInterval || 0;

        this.watchSubscription = await Location.watchPositionAsync(
          {
            accuracy,
            timeInterval,
            distanceInterval,
          },
          (location) => {
            const locationData = this.convertToLocationData(location);
            this.currentLocation = locationData;
            if (this.locationCallback) {
              this.locationCallback(locationData);
            }
          },
        );

        resolve(true);
      } catch (error) {
        console.error('Error starting foreground tracking:', error);
        this.isTracking = false;
        resolve(false);
      }
    });
  }

  async startBackgroundTracking(
    callback: (location: LocationData) => void,
    options?: LocationTrackingOptions,
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      const permissions = await this.checkPermissions();
      if (!permissions.background) {
        console.warn('Background permission not granted, using foreground tracking');
        return this.startForegroundTracking(callback, options);
      }

      // Register background task
      this.registerBackgroundTask(callback);

      const accuracy = this.getAccuracy(options?.accuracy);
      const timeInterval = options?.timeInterval || ENV.LOCATION_UPDATE_INTERVAL;
      const distanceInterval = options?.distanceInterval || 0;

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy,
        timeInterval,
        distanceInterval,
        foregroundService: options?.foregroundService
          ? {
              notificationTitle: options.foregroundService.notificationTitle,
              notificationBody: options.foregroundService.notificationBody,
            }
          : undefined,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting background tracking:', error);
      this.isTracking = false;
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }

    Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch((error) => {
      console.error('Error stopping background location updates:', error);
    });

    this.isTracking = false;
    this.locationCallback = null;
  }

  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  private registerBackgroundTask(callback: (location: LocationData) => void): void {
    if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
      return;
    }

    TaskManager.defineTask(LOCATION_TASK_NAME, ({data, error}) => {
      if (error) {
        console.error('Background location task error:', error);
        return;
      }

      if (data) {
        const {locations} = data as {
          locations: Location.LocationObject[];
        };

        if (locations && locations.length > 0) {
          const location = locations[locations.length - 1];
          const locationData = this.convertToLocationData(location);
          this.currentLocation = locationData;
          callback(locationData);
        }
      }
    });
  }

  private convertToLocationData(
    location: Location.LocationObject,
  ): LocationData {
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude ?? null,
      accuracy: location.coords.accuracy ?? null,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? null,
      heading: location.coords.heading ?? null,
      speed: location.coords.speed ?? null,
      timestamp: location.timestamp,
    };
  }

  private getAccuracy(
    accuracy?: Location.Accuracy,
  ): Location.Accuracy {
    if (accuracy) {
      return accuracy;
    }

    const accuracySetting = ENV.LOCATION_ACCURACY;
    switch (accuracySetting) {
      case 'highest':
        return Location.Accuracy.Highest;
      case 'high':
        return Location.Accuracy.High;
      case 'balanced':
        return Location.Accuracy.Balanced;
      case 'low':
        return Location.Accuracy.Low;
      case 'lowest':
        return Location.Accuracy.Lowest;
      default:
        return Location.Accuracy.Balanced;
    }
  }
}

export const locationService = new LocationService();

