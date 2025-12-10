// Conditional import for Firebase Analytics
// This allows the app to work even if Firebase is not fully configured
let analyticsModule: any = null;
let isFirebaseAvailable = false;

try {
  analyticsModule = require('@react-native-firebase/analytics');
  isFirebaseAvailable = true;
} catch (error) {
  console.warn('Firebase Analytics not available. Analytics will be disabled:', error);
  isFirebaseAvailable = false;
}

// Helper function to get analytics instance
const getAnalytics = () => {
  if (!isFirebaseAvailable || !analyticsModule) {
    return null;
  }
  try {
    return analyticsModule.default();
  } catch (error) {
    console.warn('Error getting analytics instance:', error);
    return null;
  }
};

/**
 * Analytics Service
 * 
 * Provides utility functions for logging events to Firebase Analytics.
 * 
 * Event Naming Convention: Use snake_case (e.g., 'screen_view', 'button_click')
 * 
 * Best Practices:
 * - Use descriptive, consistent event names
 * - Keep parameter names under 40 characters
 * - Limit parameters to 25 per event
 * - Use snake_case for event and parameter names
 */

class AnalyticsService {
  private isEnabled: boolean = true;

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (!isFirebaseAvailable) {
      console.warn('Firebase Analytics not available. Skipping initialization.');
      return;
    }

    try {
      const analytics = getAnalytics();
      if (analytics) {
        // Set analytics collection enabled (can be disabled for privacy)
        await analytics.setAnalyticsCollectionEnabled(this.isEnabled);
        console.log('Firebase Analytics initialized');
      }
    } catch (error) {
      console.error('Error initializing Firebase Analytics:', error);
    }
  }

  /**
   * Enable or disable analytics collection
   */
  async setAnalyticsCollectionEnabled(enabled: boolean): Promise<void> {
    if (!isFirebaseAvailable) return;

    try {
      this.isEnabled = enabled;
      const analytics = getAnalytics();
      if (analytics) {
        await analytics.setAnalyticsCollectionEnabled(enabled);
      }
    } catch (error) {
      console.error('Error setting analytics collection enabled:', error);
    }
  }

  /**
   * Log a screen view
   * @param screenName - Name of the screen (e.g., 'dashboard', 'profile')
   * @param screenClass - Optional screen class name
   */
  async logScreenView(
    screenName: string,
    screenClass?: string,
  ): Promise<void> {
    if (!this.isEnabled || !isFirebaseAvailable) return;

    try {
      const analytics = getAnalytics();
      if (analytics) {
        await analytics.logScreenView({
          screen_name: screenName,
          screen_class: screenClass || screenName,
        });
        console.log(`[Analytics] Screen view: ${screenName}`);
      }
    } catch (error) {
      console.error('Error logging screen view:', error);
    }
  }

  /**
   * Log a custom event
   * @param name - Event name (use snake_case, e.g., 'button_click', 'form_submit')
   * @param params - Optional event parameters (max 25 parameters, keys max 40 chars)
   */
  async logEvent(name: string, params?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Validate event name
      if (!name || name.length === 0) {
        console.warn('[Analytics] Event name cannot be empty');
        return;
      }

      // Validate parameters
      if (params) {
        const paramKeys = Object.keys(params);
        if (paramKeys.length > 25) {
          console.warn(
            '[Analytics] Event has more than 25 parameters, truncating',
          );
          const truncatedParams: Record<string, any> = {};
          paramKeys.slice(0, 25).forEach((key) => {
            truncatedParams[key] = params[key];
          });
          params = truncatedParams;
        }

        // Validate parameter keys length
        Object.keys(params).forEach((key) => {
          if (key.length > 40) {
            console.warn(
              `[Analytics] Parameter key "${key}" exceeds 40 characters`,
            );
          }
        });
      }

      const analytics = getAnalytics();
      if (analytics) {
        await analytics.logEvent(name, params);
        console.log(`[Analytics] Event: ${name}`, params || {});
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  /**
   * Set user ID for analytics
   * @param userId - User identifier
   */
  async logUserId(userId: string | null): Promise<void> {
    if (!this.isEnabled || !isFirebaseAvailable) return;

    try {
      const analytics = getAnalytics();
      if (analytics) {
        await analytics.setUserId(userId);
        console.log(`[Analytics] User ID set: ${userId || 'null'}`);
      }
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  /**
   * Set user property
   * @param name - Property name (max 24 characters, alphanumeric + underscore)
   * @param value - Property value (max 36 characters)
   */
  async logUserProperty(name: string, value: string | null): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Validate property name
      if (name.length > 24) {
        console.warn(
          `[Analytics] User property name "${name}" exceeds 24 characters`,
        );
        return;
      }

      // Validate property value
      if (value && value.length > 36) {
        console.warn(
          `[Analytics] User property value exceeds 36 characters, truncating`,
        );
        value = value.substring(0, 36);
      }

      const analytics = getAnalytics();
      if (analytics) {
        await analytics.setUserProperty(name, value);
        console.log(`[Analytics] User property set: ${name} = ${value || 'null'}`);
      }
    } catch (error) {
      console.error('Error setting user property:', error);
    }
  }

  /**
   * Log app launch event
   */
  async logAppLaunch(): Promise<void> {
    await this.logEvent('app_launch', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log button click event
   * @param buttonName - Name of the button
   * @param screenName - Screen where button was clicked
   * @param additionalParams - Additional parameters
   */
  async logButtonClick(
    buttonName: string,
    screenName?: string,
    additionalParams?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent('button_click', {
      button_name: buttonName,
      screen_name: screenName,
      ...additionalParams,
    });
  }

  /**
   * Log form submission event
   * @param formName - Name of the form
   * @param success - Whether submission was successful
   * @param additionalParams - Additional parameters
   */
  async logFormSubmission(
    formName: string,
    success: boolean,
    additionalParams?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent('form_submit', {
      form_name: formName,
      success: success,
      ...additionalParams,
    });
  }

  /**
   * Log purchase event
   * @param value - Purchase value
   * @param currency - Currency code (e.g., 'USD')
   * @param items - Array of purchased items
   * @param additionalParams - Additional parameters
   */
  async logPurchase(
    value: number,
    currency: string = 'USD',
    items?: Array<{
      item_id?: string;
      item_name?: string;
      item_category?: string;
      quantity?: number;
      price?: number;
    }>,
    additionalParams?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent('purchase', {
      value: value,
      currency: currency,
      items: items || [],
      ...additionalParams,
    });
  }

  /**
   * Reset analytics data (useful for testing)
   */
  async resetAnalyticsData(): Promise<void> {
    if (!isFirebaseAvailable) return;

    try {
      const analytics = getAnalytics();
      if (analytics) {
        await analytics.resetAnalyticsData();
        console.log('[Analytics] Analytics data reset');
      }
    } catch (error) {
      console.error('Error resetting analytics data:', error);
    }
  }

  /**
   * Get app instance ID
   */
  async getAppInstanceId(): Promise<string | null> {
    if (!isFirebaseAvailable) return null;

    try {
      const analytics = getAnalytics();
      if (analytics) {
        return await analytics.getAppInstanceId();
      }
    } catch (error) {
      console.error('Error getting app instance ID:', error);
    }
    return null;
  }
}

export const analyticsService = new AnalyticsService();

// Export commonly used event names for consistency
export const AnalyticsEvents = {
  // Screen views
  SCREEN_VIEW: 'screen_view',
  
  // User actions
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  
  // App lifecycle
  APP_LAUNCH: 'app_launch',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  
  // Commerce
  PURCHASE: 'purchase',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_ITEM: 'view_item',
  
  // Engagement
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SHARE: 'share',
  
  // Custom events
  LOCATION_TRACKING_START: 'location_tracking_start',
  LOCATION_TRACKING_STOP: 'location_tracking_stop',
  VOICE_INPUT_START: 'voice_input_start',
  VOICE_INPUT_COMPLETE: 'voice_input_complete',
} as const;

// Export commonly used parameter names
export const AnalyticsParams = {
  SCREEN_NAME: 'screen_name',
  SCREEN_CLASS: 'screen_class',
  BUTTON_NAME: 'button_name',
  FORM_NAME: 'form_name',
  SUCCESS: 'success',
  ERROR_MESSAGE: 'error_message',
  ITEM_ID: 'item_id',
  ITEM_NAME: 'item_name',
  ITEM_CATEGORY: 'item_category',
  VALUE: 'value',
  CURRENCY: 'currency',
  QUANTITY: 'quantity',
  PRICE: 'price',
  USER_ID: 'user_id',
  METHOD: 'method',
} as const;

