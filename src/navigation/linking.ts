import {LinkingOptions} from '@react-navigation/native';
import {Linking} from 'react-native';

// Deep link configuration
export const linkingConfig: LinkingOptions<any> = {
  prefixes: [
    'mvpnotification://', // Custom URI scheme
    'https://mvpnotification.app', // Universal/App Links
    'https://www.mvpnotification.app', // Universal/App Links (with www)
  ],
  config: {
    screens: {
      // Root stack
      Login: 'login',
      Main: {
        screens: {
          // Tab navigator screens
          Dashboard: 'home',
          Companies: 'companies',
          Reminders: 'reminders',
          PersonalTasks: 'tasks',
          LiveTracking: 'tracking',
        },
      },
      // Detail screens (outside tabs, in root stack)
      Profile: {
        path: 'profile/:id',
        parse: {
          id: (id: string) => id,
        },
      },
      Product: {
        path: 'product/:sku',
        parse: {
          sku: (sku: string) => sku,
        },
      },
      // Fallback
      NotFound: '*',
    },
  },
};

// Helper function to get initial URL
export const getInitialURL = async (): Promise<string | null> => {
  // Check if app was opened from a deep link
  const url = await Linking.getInitialURL();
  if (url != null) {
    return url;
  }
  return null;
};

