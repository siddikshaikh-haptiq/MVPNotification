import {useEffect, useRef} from 'react';
import {NavigationContainerRef} from '@react-navigation/native';
import {analyticsService} from '@services/analyticsService';

/**
 * Hook to track screen views automatically with React Navigation
 * 
 * Usage:
 * ```tsx
 * const navigationRef = useRef<NavigationContainerRef<any>>(null);
 * 
 * <NavigationContainer
 *   ref={navigationRef}
 *   onReady={() => {
 *     useAnalyticsScreenTracking(navigationRef);
 *   }}
 * >
 * ```
 */
export const useAnalyticsScreenTracking = (
  navigationRef: React.RefObject<NavigationContainerRef<any>>,
) => {
  const routeNameRef = useRef<string | undefined>();

  useEffect(() => {
    if (!navigationRef.current) {
      return;
    }

    const getActiveRouteName = (
      navigationState: any,
    ): string | undefined => {
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

    const handleStateChange = () => {
      const previousRouteName = routeNameRef.current;
      const currentRouteName = getActiveRouteName(
        navigationRef.current?.getState(),
      );

      if (previousRouteName !== currentRouteName && currentRouteName) {
        // Log screen view
        analyticsService.logScreenView(currentRouteName);
        routeNameRef.current = currentRouteName;
      }
    };

    // Get initial route name
    const initialState = navigationRef.current.getState();
    const initialRouteName = getActiveRouteName(initialState);
    if (initialRouteName) {
      routeNameRef.current = initialRouteName;
      analyticsService.logScreenView(initialRouteName);
    }

    // Return cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [navigationRef]);

  return {
    onStateChange: () => {
      const currentRouteName = getActiveRouteName(
        navigationRef.current?.getState(),
      );
      if (currentRouteName && routeNameRef.current !== currentRouteName) {
        analyticsService.logScreenView(currentRouteName);
        routeNameRef.current = currentRouteName;
      }
    },
  };
};

// Helper function to get active route name
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

