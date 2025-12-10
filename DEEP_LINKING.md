# Deep Linking Implementation Guide

This document describes the deep linking implementation for MVP Notification app, supporting both custom URI schemes and Universal/App Links.

## Overview

The app supports two types of deep links:

1. **Custom URI Scheme**: `mvpnotification://` - Works everywhere but requires the app to be installed
2. **Universal/App Links**: `https://mvpnotification.app` - Opens in app if installed, otherwise in browser

## Supported Routes

### Main Routes
- `mvpnotification://home` or `https://mvpnotification.app/home` - Dashboard
- `mvpnotification://companies` or `https://mvpnotification.app/companies` - Companies screen
- `mvpnotification://reminders` or `https://mvpnotification.app/reminders` - Reminders screen
- `mvpnotification://tasks` or `https://mvpnotification.app/tasks` - Personal Tasks screen
- `mvpnotification://tracking` or `https://mvpnotification.app/tracking` - Live Tracking screen
- `mvpnotification://login` or `https://mvpnotification.app/login` - Login screen

### Parameterized Routes
- `mvpnotification://profile/:id` or `https://mvpnotification.app/profile/:id` - Profile detail
  - Example: `mvpnotification://profile/123` or `https://mvpnotification.app/profile/123`
- `mvpnotification://product/:sku` or `https://mvpnotification.app/product/:sku` - Product detail
  - Example: `mvpnotification://product/ABC123` or `https://mvpnotification.app/product/ABC123`

## Configuration

### Android (AndroidManifest.xml)

Intent filters are configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Custom URI Scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="mvpnotification" />
</intent-filter>

<!-- Universal/App Links -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="mvpnotification.app"
        android:pathPrefix="/" />
</intent-filter>
```

### iOS (app.json)

Configuration is in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "CFBundleURLTypes": [
        {
          "CFBundleURLSchemes": ["mvpnotification"],
          "CFBundleURLName": "com.mvpnotification.app"
        }
      ]
    },
    "associatedDomains": [
      "applinks:mvpnotification.app",
      "applinks:www.mvpnotification.app"
    ]
  }
}
```

### React Navigation (linking.ts)

Linking configuration is in `src/navigation/linking.ts`:

```typescript
export const linkingConfig: LinkingOptions<any> = {
  prefixes: [
    'mvpnotification://',
    'https://mvpnotification.app',
    'https://www.mvpnotification.app',
  ],
  config: {
    screens: {
      // Route mappings
    },
  },
};
```

## Hosting Configuration Files

### iOS: apple-app-site-association

**Location**: `https://mvpnotification.app/.well-known/apple-app-site-association`

**Content**: See `deep-links/.well-known/apple-app-site-association`

**Requirements**:
- No file extension
- Content-Type: `application/json`
- HTTPS required
- No redirects

### Android: assetlinks.json

**Location**: `https://mvpnotification.app/.well-known/assetlinks.json`

**Content**: See `deep-links/.well-known/assetlinks.json`

**Requirements**:
- Content-Type: `application/json`
- HTTPS required
- No redirects
- Must include SHA-256 fingerprint of your app signing certificate

## Setup Steps

### 1. Get Signing Information

#### iOS Team ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Find your Team ID (e.g., `ABC123XYZ`)
3. Update `apple-app-site-association` file

#### Android SHA-256 Fingerprint
```bash
# Debug keystore
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

Copy the SHA-256 fingerprint and update `assetlinks.json`.

### 2. Host the Files

Upload both files to your web server:
- `https://mvpnotification.app/.well-known/apple-app-site-association`
- `https://mvpnotification.app/.well-known/assetlinks.json`

Ensure:
- Files are publicly accessible
- HTTPS is enabled
- Correct Content-Type headers
- No redirects

### 3. Verify Hosting

```bash
# Test iOS file
curl -I https://mvpnotification.app/.well-known/apple-app-site-association
# Should return: Content-Type: application/json

# Test Android file
curl -I https://mvpnotification.app/.well-known/assetlinks.json
# Should return: Content-Type: application/json
```

## Testing

### Android Testing

#### Custom URI Scheme
```bash
# Using ADB
adb shell am start -W -a android.intent.action.VIEW -d "mvpnotification://home" com.mvpnotification

# Test profile route
adb shell am start -W -a android.intent.action.VIEW -d "mvpnotification://profile/123" com.mvpnotification

# Test product route
adb shell am start -W -a android.intent.action.VIEW -d "mvpnotification://product/ABC123" com.mvpnotification
```

#### Universal/App Links
```bash
# Test App Link
adb shell am start -W -a android.intent.action.VIEW -d "https://mvpnotification.app/home" com.mvpnotification

# Verify App Links verification
adb shell pm get-app-links com.mvpnotification
```

#### From Browser/Email
1. Open a link: `https://mvpnotification.app/profile/123`
2. Should open in app if installed, otherwise in browser

### iOS Testing

#### Custom URI Scheme
```bash
# Using Simulator
xcrun simctl openurl booted "mvpnotification://home"

# Test profile route
xcrun simctl openurl booted "mvpnotification://profile/123"

# Test product route
xcrun simctl openurl booted "mvpnotification://product/ABC123"
```

#### Universal Links
```bash
# Test Universal Link
xcrun simctl openurl booted "https://mvpnotification.app/home"
```

#### From Safari/Email
1. Open a link: `https://mvpnotification.app/profile/123`
2. Should open in app if installed, otherwise in Safari

### Testing in Development

#### React Native Debugger
```javascript
// In React Native Debugger console
Linking.openURL('mvpnotification://home');
Linking.openURL('mvpnotification://profile/123');
Linking.openURL('https://mvpnotification.app/product/ABC123');
```

#### From Terminal (Mac/Linux)
```bash
# Custom URI
open "mvpnotification://home"

# Universal Link
open "https://mvpnotification.app/profile/123"
```

## Troubleshooting

### Android Issues

#### App Links Not Working
1. **Verify assetlinks.json**:
   ```bash
   curl https://mvpnotification.app/.well-known/assetlinks.json
   ```

2. **Check SHA-256 fingerprint**:
   - Must match the keystore used to sign the app
   - Debug and release use different fingerprints

3. **Verify App Links**:
   ```bash
   adb shell pm get-app-links --user cur com.mvpnotification
   ```

4. **Reset App Links**:
   ```bash
   adb shell pm set-app-links --package com.mvpnotification 0 all
   adb shell pm verify-app-links --re-verify com.mvpnotification
   ```

#### Custom URI Not Working
- Check AndroidManifest.xml has correct intent-filter
- Ensure `android:exported="true"` on MainActivity
- Rebuild the app after manifest changes

### iOS Issues

#### Universal Links Not Working
1. **Verify apple-app-site-association**:
   ```bash
   curl https://mvpnotification.app/.well-known/apple-app-site-association
   ```

2. **Check Team ID**: Must match your Apple Developer account

3. **Verify Associated Domains**:
   - Check Xcode project settings
   - Ensure domains are added in Capabilities

4. **Reset Universal Links**:
   - Delete and reinstall the app
   - iOS caches the association file

#### Custom URI Not Working
- Check Info.plist has CFBundleURLTypes
- Rebuild the app after configuration changes

### General Issues

#### Deep Link Not Navigating
1. Check React Navigation linking config
2. Verify route names match screen names
3. Check console logs for navigation errors

#### Cold Start Not Working
- Ensure `Linking.getInitialURL()` is called in App.tsx
- Check that NavigationContainer has `linking` prop

#### In-App Links Not Working
- Verify `Linking.addEventListener` is set up
- Check that navigation ref is properly configured

## Best Practices

1. **Always test both cold start and warm start**
2. **Test on physical devices** (simulators may behave differently)
3. **Use HTTPS** for Universal/App Links (required)
4. **Handle authentication** - redirect to login if needed
5. **Validate parameters** before navigating
6. **Log deep link events** for debugging
7. **Handle errors gracefully** - show user-friendly messages

## Security Considerations

1. **Validate all parameters** from deep links
2. **Sanitize user input** before using in navigation
3. **Check authentication** before showing sensitive screens
4. **Rate limit** deep link handling to prevent abuse
5. **Use HTTPS** for all Universal/App Links

## Example Usage

### Opening from Email
```html
<a href="https://mvpnotification.app/profile/123">View Profile</a>
```

### Opening from Web
```javascript
window.location.href = 'mvpnotification://home';
```

### Opening from Another App
```javascript
// React Native
Linking.openURL('mvpnotification://product/ABC123');
```

## Additional Resources

- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Android App Links](https://developer.android.com/training/app-links)
- [iOS Universal Links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Expo Linking](https://docs.expo.dev/guides/linking/)

