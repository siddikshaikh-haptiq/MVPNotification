# Firebase Analytics Integration Guide

This document describes the Firebase Analytics (Google Analytics) integration for the MVP Notification React Native app.

## Overview

The app uses `@react-native-firebase/analytics` to track user behavior, screen views, events, and user properties. Analytics data is automatically sent to Firebase and can be viewed in the Firebase Console.

## Installation Steps

### 1. Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

**Note**: If you encounter Node version issues, ensure you're using Node.js >= 20.0.0 as specified in `package.json`.

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Analytics** for your project
4. Add your apps:

#### Android Setup
1. Click "Add app" > Android
2. Enter package name: `com.mvpnotification`
3. Download `google-services.json`
4. Place it in `android/app/google-services.json` (replace the placeholder file)

#### iOS Setup
1. Click "Add app" > iOS
2. Enter bundle ID: `com.mvpnotification.app`
3. Download `GoogleService-Info.plist`
4. Place it in `ios/GoogleService-Info.plist` (replace the placeholder file)
5. Add the file to your Xcode project:
   - Open `ios/MVPNotification.xcworkspace` in Xcode
   - Drag `GoogleService-Info.plist` into the project
   - Ensure "Copy items if needed" is checked
   - Ensure it's added to the target

### 3. Android Configuration

#### Update `android/build.gradle`

Already configured:
```gradle
dependencies {
    classpath("com.google.gms:google-services:4.4.0")
}
```

#### Update `android/app/build.gradle`

Already configured:
```gradle
apply plugin: "com.google.gms.google-services"
```

#### Verify `google-services.json`

Ensure `android/app/google-services.json` contains your actual Firebase configuration (not the placeholder).

### 4. iOS Configuration

#### Install Pods

```bash
cd ios
pod install
cd ..
```

#### Verify `GoogleService-Info.plist`

Ensure `ios/GoogleService-Info.plist` contains your actual Firebase configuration and is added to the Xcode project.

### 5. Rebuild the App

After adding Firebase configuration files:

```bash
# Android
npm run android

# iOS
npm run ios
```

## Analytics Service

The analytics service (`src/services/analyticsService.ts`) provides utility functions for tracking:

### Available Functions

#### `logScreenView(screenName, screenClass?)`
Logs a screen view event.

```typescript
await analyticsService.logScreenView('dashboard');
```

#### `logEvent(name, params?)`
Logs a custom event with optional parameters.

```typescript
await analyticsService.logEvent('button_click', {
  button_name: 'submit',
  screen_name: 'login',
});
```

#### `logUserId(userId)`
Sets the user ID for analytics.

```typescript
await analyticsService.logUserId('user123');
```

#### `logUserProperty(name, value)`
Sets a user property.

```typescript
await analyticsService.logUserProperty('subscription_type', 'premium');
```

#### Helper Functions

- `logAppLaunch()` - Logs app launch event
- `logButtonClick(buttonName, screenName?, params?)` - Logs button click
- `logFormSubmission(formName, success, params?)` - Logs form submission
- `logPurchase(value, currency, items?, params?)` - Logs purchase event

## Event Naming Convention

**Use snake_case for all event and parameter names** (e.g., `button_click`, `screen_view`, `form_submit`).

### Best Practices

1. **Event Names**:
   - Use descriptive, consistent names
   - Keep under 40 characters
   - Use snake_case
   - Examples: `button_click`, `form_submit`, `screen_view`

2. **Parameter Names**:
   - Keep under 40 characters
   - Use snake_case
   - Limit to 25 parameters per event
   - Examples: `button_name`, `screen_name`, `form_name`

3. **Parameter Values**:
   - Strings: max 100 characters
   - Numbers: use appropriate types
   - Arrays: limit size

### Predefined Events

The service exports commonly used event names in `AnalyticsEvents`:

```typescript
import {AnalyticsEvents} from '@services/analyticsService';

analyticsService.logEvent(AnalyticsEvents.BUTTON_CLICK, {...});
analyticsService.logEvent(AnalyticsEvents.FORM_SUBMIT, {...});
analyticsService.logEvent(AnalyticsEvents.LOGIN, {...});
```

## Automatic Screen Tracking

Screen views are automatically tracked via React Navigation integration in `AppNavigator.tsx`. Every screen navigation is logged to Firebase Analytics.

## Example Instrumentation

### 1. App Launch Tracking

Already implemented in `App.tsx`:
```typescript
analyticsService.logAppLaunch();
```

### 2. Button Click Tracking

The `Button` component supports automatic tracking:

```typescript
<Button
  title="Submit"
  onPress={handleSubmit}
  analyticsId="submit_button"
  analyticsParams={{form_name: 'contact'}}
/>
```

### 3. Form Submission Tracking

Example from `LoginScreen.tsx`:
```typescript
analyticsService.logFormSubmission('login', true, {
  method: 'email',
});
```

### 4. Purchase Event Tracking

```typescript
analyticsService.logPurchase(
  99.99, // value
  'USD', // currency
  [
    {
      item_id: 'product123',
      item_name: 'Premium Subscription',
      item_category: 'subscription',
      quantity: 1,
      price: 99.99,
    },
  ],
  {
    transaction_id: 'txn_123',
    payment_method: 'credit_card',
  }
);
```

### 5. Custom Event Tracking

```typescript
// Track location tracking start
analyticsService.logEvent('location_tracking_start', {
  user_id: currentUser.id,
  tracking_mode: 'background',
});

// Track voice input
analyticsService.logEvent('voice_input_complete', {
  input_length: transcribedText.length,
  language: 'en-US',
});
```

## Verification Steps

### Android Verification

#### 1. Check ADB Logs

```bash
# Filter Firebase Analytics logs
adb logcat | grep -i "firebase\|analytics"

# Or use tag filter
adb logcat -s FirebaseAnalytics
```

Look for logs like:
```
FirebaseAnalytics: Event logged: screen_view
FirebaseAnalytics: Event logged: button_click
```

#### 2. Enable Debug Mode

Add to `android/app/src/main/AndroidManifest.xml` (inside `<application>`):

```xml
<meta-data
    android:name="firebase_analytics_debug_mode"
    android:value="true" />
```

#### 3. Check Firebase Console

1. Go to Firebase Console > Analytics > Events
2. Wait 24-48 hours for data to appear (or use DebugView for real-time)

#### 4. Use DebugView (Real-time)

1. Enable debug mode (see above)
2. In Firebase Console, go to Analytics > DebugView
3. Events should appear in real-time

### iOS Verification

#### 1. Check Xcode Console

1. Run app from Xcode
2. Check console for Firebase Analytics logs:
   ```
   [Firebase/Analytics] Event logged: screen_view
   [Firebase/Analytics] Event logged: button_click
   ```

#### 2. Enable Debug Mode

Add to `ios/MVPNotification/Info.plist`:

```xml
<key>FIREBASE_ANALYTICS_DEBUG_MODE</key>
<true/>
```

#### 3. Check Firebase Console

Same as Android - go to Analytics > Events or DebugView

### Testing in Debug vs Release

#### Debug Builds
- Analytics collection is enabled by default
- Use DebugView for real-time verification
- Events appear immediately in DebugView

#### Release Builds
- Analytics collection is enabled
- Events are batched and sent periodically
- Data appears in Firebase Console within 24-48 hours

## Common Issues and Solutions

### Issue: Events Not Appearing

**Solution**:
1. Verify `google-services.json` / `GoogleService-Info.plist` are correct
2. Check that files are in the correct locations
3. Rebuild the app after adding configuration files
4. Enable debug mode for real-time verification
5. Check network connectivity

### Issue: Build Errors

**Solution**:
1. Clean build:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   
   # iOS
   cd ios && pod deintegrate && pod install && cd ..
   ```
2. Rebuild the app
3. Ensure all dependencies are installed

### Issue: Analytics Not Initializing

**Solution**:
1. Check console logs for initialization errors
2. Verify Firebase configuration files are valid JSON/XML
3. Ensure `analyticsService.initialize()` is called in `App.tsx`

## Privacy and Compliance

### Disable Analytics Collection

```typescript
// Disable for specific users (e.g., GDPR)
await analyticsService.setAnalyticsCollectionEnabled(false);
```

### Reset Analytics Data

```typescript
// Useful for testing
await analyticsService.resetAnalyticsData();
```

## File Structure

```
MVPNotification/
├── android/
│   ├── app/
│   │   ├── google-services.json          # Firebase config (replace with actual)
│   │   └── build.gradle                  # Updated with Google Services plugin
│   └── build.gradle                      # Updated with Google Services classpath
├── ios/
│   ├── GoogleService-Info.plist          # Firebase config (replace with actual)
│   └── Podfile                           # Pods installed automatically
├── src/
│   ├── services/
│   │   └── analyticsService.ts            # Analytics service
│   ├── navigation/
│   │   └── AppNavigator.tsx               # Screen tracking integration
│   └── components/
│       └── Button.tsx                    # Button click tracking
└── App.tsx                                # Analytics initialization
```

## Next Steps

1. **Replace Configuration Files**:
   - Download actual `google-services.json` from Firebase Console
   - Download actual `GoogleService-Info.plist` from Firebase Console
   - Replace placeholder files

2. **Rebuild the App**:
   ```bash
   npm run android  # or npm run ios
   ```

3. **Verify Integration**:
   - Check ADB logs (Android) or Xcode console (iOS)
   - Use Firebase DebugView for real-time verification
   - Check Firebase Console after 24-48 hours

4. **Add More Tracking**:
   - Add analytics to other screens as needed
   - Track custom events for your use cases
   - Set user properties when users sign in

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [React Native Firebase Analytics](https://rnfirebase.io/analytics/usage)
- [Firebase Console](https://console.firebase.google.com/)

