import React, {useRef, useEffect} from 'react';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {LoginScreen} from '@screens/LoginScreen';
import {DashboardScreen} from '@screens/DashboardScreen';
import {CompaniesScreen} from '@screens/CompaniesScreen';
import {RemindersScreen} from '@screens/RemindersScreen';
import {PersonalTasksScreen} from '@screens/PersonalTasksScreen';
import {LiveTrackingScreen} from '@screens/LiveTrackingScreen';
import {ProfileScreen} from '@screens/ProfileScreen';
import {ProductScreen} from '@screens/ProductScreen';
import {linkingConfig} from './linking';
import {analyticsService} from '@services/analyticsService';
import {Text} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => <Text style={{color}}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Companies"
        component={CompaniesScreen}
        options={{
          tabBarLabel: 'Companies',
          tabBarIcon: ({color}) => <Text style={{color}}>🏢</Text>,
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarLabel: 'Reminders',
          tabBarIcon: ({color}) => <Text style={{color}}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="PersonalTasks"
        component={PersonalTasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({color}) => <Text style={{color}}>✓</Text>,
        }}
      />
      <Tab.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          tabBarLabel: 'Tracking',
          tabBarIcon: ({color}) => <Text style={{color}}>📍</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const {colors} = useTheme();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>();

  // Helper function to get active route name from navigation state
  const getActiveRouteName = (navigationState: any): string | undefined => {
    if (!navigationState) {
      return undefined;
    }

    const route = navigationState.routes[navigationState.index];

    // Handle nested navigators (tabs, stacks)
    if (route.state) {
      return getActiveRouteName(route.state);
    }

    return route.name;
  };

  // Track screen views on navigation state change
  const handleStateChange = () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(
      navigationRef.current?.getState(),
    );

    if (previousRouteName !== currentRouteName && currentRouteName) {
      // Log screen view to Firebase Analytics
      analyticsService.logScreenView(currentRouteName);
      routeNameRef.current = currentRouteName;
    }
  };

  // Track initial screen on ready
  const handleReady = () => {
    const currentRouteName = getActiveRouteName(
      navigationRef.current?.getState(),
    );
    if (currentRouteName) {
      routeNameRef.current = currentRouteName;
      analyticsService.logScreenView(currentRouteName);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      onReady={handleReady}
      onStateChange={handleStateChange}
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{headerShown: true}}
            />
            <Stack.Screen
              name="Product"
              component={ProductScreen}
              options={{headerShown: true}}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

