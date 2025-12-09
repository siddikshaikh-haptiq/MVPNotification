import React from 'react';
import {SafeAreaView} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ThemeProvider, useTheme} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {LocationProvider} from '@context/LocationContext';
import {AppNavigator} from '@navigation/AppNavigator';
import './global.css';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();

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

