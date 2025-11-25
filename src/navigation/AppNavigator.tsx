import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {LoginScreen} from '@screens/LoginScreen';
import {DashboardScreen} from '@screens/DashboardScreen';
import {CompaniesScreen} from '@screens/CompaniesScreen';
import {RemindersScreen} from '@screens/RemindersScreen';
import {PersonalTasksScreen} from '@screens/PersonalTasksScreen';
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
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const {colors} = useTheme();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer
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
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

