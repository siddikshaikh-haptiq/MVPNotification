import React from 'react';
import {StatusBar, SafeAreaView} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ThemeProvider, useTheme} from '@context/ThemeContext';
import {AuthProvider} from '@context/AuthContext';
import {AppNavigator} from '@navigation/AppNavigator';
import './global.css';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;

