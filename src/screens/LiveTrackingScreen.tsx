import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useLocation} from '@context/LocationContext';
import {useTheme} from '@context/ThemeContext';
import {Button} from '@components/Button';
import {Card} from '@components/Card';
import {LocationData} from '@types/index';

export const LiveTrackingScreen: React.FC = () => {
  const {colors, isDark} = useTheme();
  const {
    isTracking,
    currentLocation,
    trackingSession,
    startTracking,
    stopTracking,
    locationHistory,
    clearLocationHistory,
    socketConnected,
  } = useLocation();

  const [isStarting, setIsStarting] = useState(false);

  const handleStartTracking = async (useBackground: boolean = false) => {
    setIsStarting(true);
    try {
      const success = await startTracking(useBackground);
      if (!success) {
        Alert.alert(
          'Error',
          'Failed to start tracking. Please check location permissions.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while starting tracking.');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopTracking = async () => {
    try {
      await stopTracking();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while stopping tracking.');
      console.error(error);
    }
  };

  const formatCoordinate = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(6);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getDistance = (loc1: LocationData, loc2: LocationData): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getTotalDistance = (): number => {
    if (locationHistory.length < 2) {
      return 0;
    }

    let total = 0;
    for (let i = 1; i < locationHistory.length; i++) {
      total += getDistance(locationHistory[i - 1], locationHistory[i]);
    }

    return total;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    button: {
      flex: 1,
    },
    locationCard: {
      marginBottom: 16,
    },
    locationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    value: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 12,
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    historyList: {
      maxHeight: 200,
    },
    historyItem: {
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: colors.card,
    },
    historyTime: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    historyCoords: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Section */}
      <Card>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isTracking
                  ? socketConnected
                    ? '#10b981'
                    : '#f59e0b'
                  : '#ef4444',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isTracking
              ? socketConnected
                ? 'Tracking Active (Connected)'
                : 'Tracking Active (Offline)'
              : 'Tracking Inactive'}
          </Text>
        </View>

        {trackingSession && (
          <View style={styles.locationRow}>
            <Text style={styles.label}>Session ID:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
              {trackingSession.id}
            </Text>
          </View>
        )}
      </Card>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <>
            <Button
              title="Start (Foreground)"
              onPress={() => handleStartTracking(false)}
              disabled={isStarting}
              style={styles.button}
            />
            <Button
              title="Start (Background)"
              onPress={() => handleStartTracking(true)}
              disabled={isStarting}
              style={styles.button}
            />
          </>
        ) : (
          <Button
            title="Stop Tracking"
            onPress={handleStopTracking}
            variant="danger"
            style={styles.button}
          />
        )}
        {isStarting && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{marginLeft: 12}}
          />
        )}
      </View>

      {/* Current Location */}
      {currentLocation && (
        <Card style={styles.locationCard}>
          <Text style={[styles.label, {marginBottom: 12, fontSize: 16}]}>
            Current Location
          </Text>
          <View style={styles.locationRow}>
            <Text style={styles.label}>Latitude:</Text>
            <Text style={styles.value}>
              {formatCoordinate(currentLocation.latitude)}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.label}>Longitude:</Text>
            <Text style={styles.value}>
              {formatCoordinate(currentLocation.longitude)}
            </Text>
          </View>
          {currentLocation.accuracy !== null && (
            <View style={styles.locationRow}>
              <Text style={styles.label}>Accuracy:</Text>
              <Text style={styles.value}>
                {currentLocation.accuracy.toFixed(1)} m
              </Text>
            </View>
          )}
          {currentLocation.speed !== null && (
            <View style={styles.locationRow}>
              <Text style={styles.label}>Speed:</Text>
              <Text style={styles.value}>
                {(currentLocation.speed * 3.6).toFixed(1)} km/h
              </Text>
            </View>
          )}
          <View style={styles.locationRow}>
            <Text style={styles.label}>Last Update:</Text>
            <Text style={styles.value}>
              {formatTimestamp(currentLocation.timestamp)}
            </Text>
          </View>
        </Card>
      )}

      {/* Statistics */}
      {isTracking && locationHistory.length > 0 && (
        <Card>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{locationHistory.length}</Text>
              <Text style={styles.statLabel}>Updates</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(getTotalDistance() / 1000).toFixed(2)} km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            {trackingSession && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.floor(
                    (Date.now() - new Date(trackingSession.startTime).getTime()) /
                      1000 /
                      60,
                  )}{' '}
                  min
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Location History */}
      {locationHistory.length > 0 && (
        <View>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Location History</Text>
            <Button
              title="Clear"
              onPress={clearLocationHistory}
              variant="secondary"
              style={{paddingHorizontal: 12, paddingVertical: 6}}
            />
          </View>
          <ScrollView style={styles.historyList} nestedScrollEnabled>
            {locationHistory.slice(-10).reverse().map((location, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyTime}>
                  {formatTimestamp(location.timestamp)}
                </Text>
                <Text style={styles.historyCoords}>
                  {formatCoordinate(location.latitude)},{' '}
                  {formatCoordinate(location.longitude)}
                </Text>
                {location.accuracy !== null && (
                  <Text style={styles.historyCoords}>
                    Accuracy: {location.accuracy.toFixed(1)}m
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {!currentLocation && !isTracking && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Start tracking to see your location updates in real-time
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

