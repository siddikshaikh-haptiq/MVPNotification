import React, {useEffect, useRef} from 'react';
import {SafeAreaView, Linking, Alert, AppState, AppStateStatus} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ThemeProvider, useTheme} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {LocationProvider} from '@context/LocationContext';
import {AppNavigator} from '@navigation/AppNavigator';
import {analyticsService, AnalyticsEvents} from '@services/analyticsService';
import './global.css';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();
  const navigationRef = useRef<any>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Initialize Firebase Analytics
    analyticsService.initialize().then(() => {
      // Log app launch
      analyticsService.logAppLaunch();
    });

    // Track app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        analyticsService.logEvent(AnalyticsEvents.APP_FOREGROUND);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background
        analyticsService.logEvent(AnalyticsEvents.APP_BACKGROUND);
      }
      appState.current = nextAppState;
    });

    // Handle deep links when app is already running
    const handleDeepLink = (event: {url: string}) => {
      const {url} = event;
      console.log('Deep link received:', url);
      
      // Track deep link open
      analyticsService.logEvent('deep_link_open', {
        url: url,
      });
      
      // NavigationContainer will handle the navigation automatically
      // But we can add custom logic here if needed
      if (url.includes('profile/')) {
        // Custom handling if needed
      } else if (url.includes('product/')) {
        // Custom handling if needed
      }
    };

    // Listen for deep links while app is running
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened from deep link:', url);
        handleDeepLink({url});
      }
    });

    return () => {
      subscription.remove();
      linkingSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;

