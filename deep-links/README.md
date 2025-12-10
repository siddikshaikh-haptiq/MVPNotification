# Deep Link Configuration Files

This directory contains the configuration files needed for Universal/App Links on iOS and Android.

## Files

### `apple-app-site-association`
- **Platform**: iOS
- **Location**: `https://mvpnotification.app/.well-known/apple-app-site-association`
- **Purpose**: Enables Universal Links on iOS

### `assetlinks.json`
- **Platform**: Android
- **Location**: `https://mvpnotification.app/.well-known/assetlinks.json`
- **Purpose**: Enables App Links on Android

## Setup Instructions

### 1. Get Your App Signing Information

#### iOS
- Get your **Team ID** from Apple Developer account
- Update `TEAM_ID` in `apple-app-site-association`

#### Android
- Get your app's **SHA-256 fingerprint**:
  ```bash
  # For debug keystore
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # For release keystore
  keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
  ```
- Update `sha256_cert_fingerprints` in `assetlinks.json`

### 2. Host the Files

#### Option A: Static Hosting
1. Upload both files to your web server at:
   - `https://mvpnotification.app/.well-known/apple-app-site-association`
   - `https://mvpnotification.app/.well-known/assetlinks.json`

2. Ensure:
   - Files are served with `Content-Type: application/json`
   - Files are accessible without authentication
   - HTTPS is enabled (required for App Links)

#### Option B: Using a CDN
- Upload to your CDN (Cloudflare, AWS CloudFront, etc.)
- Ensure proper MIME types and HTTPS

### 3. Verify Configuration

#### iOS Verification
```bash
# Test Universal Links
curl https://mvpnotification.app/.well-known/apple-app-site-association

# Should return JSON with no redirects
```

#### Android Verification
```bash
# Test App Links
curl https://mvpnotification.app/.well-known/assetlinks.json

# Should return JSON with no redirects
```

### 4. Update Files

#### apple-app-site-association
Replace `TEAM_ID` with your actual Apple Team ID:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "ABC123XYZ.com.mvpnotification.app",
        "paths": [...]
      }
    ]
  }
}
```

#### assetlinks.json
Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` with your actual SHA-256 fingerprint:
```json
{
  "sha256_cert_fingerprints": [
    "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
  ]
}
```

## Important Notes

1. **No File Extension**: `apple-app-site-association` must NOT have a `.json` extension
2. **Content-Type**: Both files should be served with `Content-Type: application/json`
3. **HTTPS Required**: App Links require HTTPS (no HTTP)
4. **No Redirects**: Files must be directly accessible (no 301/302 redirects)
5. **Multiple Fingerprints**: For Android, you can add multiple fingerprints (debug + release)

## Testing

See `DEEP_LINKING.md` in the root directory for testing instructions.

