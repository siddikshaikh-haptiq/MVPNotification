# Setup Guide

This guide will help you set up the MVP Notification React Native application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.x
- **npm** or **pnpm** or **yarn**
- **JDK 17** (for Android development)
- **Android Studio** with Android SDK Platform 34
- **Xcode 15.4+** (for iOS development on macOS only)
- **CocoaPods** (for iOS dependencies)
- **Watchman** (optional but recommended)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id_here
API_BASE_URL=https://api.example.com
ENABLE_NOTIFICATIONS=true
```

### 3. iOS Setup (macOS only)

Navigate to the iOS directory and install CocoaPods dependencies:

```bash
cd ios
bundle install  # if using Bundler
bundle exec pod install
cd ..
```

### 4. Android Setup

Make sure you have:
- Android Studio installed
- Android SDK Platform 34 installed
- An Android emulator set up or a physical device connected

### 5. Start Metro Bundler

```bash
npm start
```

### 6. Run the Application

**For Android:**
```bash
npm run android
```

**For iOS (macOS only):**
```bash
npm run ios
```

## Project Structure

```
MVPNotification/
├── android/              # Android native code
├── ios/                 # iOS native code
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # Configuration files
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Screen components
│   ├── services/        # API and business logic
│   └── types/           # TypeScript type definitions
├── scripts/             # Utility scripts
├── App.tsx              # Main application component
├── index.js             # Entry point
└── package.json         # Dependencies and scripts
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run build:apk` - Build Android APK

## Troubleshooting

### Metro Bundler Issues
- Clear cache: `npm start -- --reset-cache`
- Delete `node_modules` and reinstall

### Android Build Issues
- Clean build: `cd android && ./gradlew clean`
- Check Android SDK version matches `build.gradle`

### iOS Build Issues
- Clean build folder in Xcode
- Reinstall pods: `cd ios && pod deintegrate && pod install`

## Next Steps

1. Configure your backend API URL in `.env`
2. Set up Google Sign-In credentials
3. Customize the app theme and branding
4. Connect to your actual API endpoints in the services

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.

