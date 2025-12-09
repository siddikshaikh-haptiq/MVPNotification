# MVP Notification

Mobile application built with **Expo**, **React Native**, and **TypeScript** for comprehensive management of companies, personal tasks, and tax reminders. MVP Notification centralizes critical information, synchronizes local notifications, and provides visual tools to prioritize deadlines and commitments.

## 🚀 Main Features

* Company panels with key metrics (pending, overdue, upcoming) and advanced filters.
* Reminder management with integration to local notification channels using `@notifee/react-native`.
* Configurable business calendars and automatic event synchronization.
* Personal tasks module with recurrences, priorities, states, and minute-by-minute alerts.
* **Live Location Tracking** with foreground and background support via WebSockets.
* Adaptive experience thanks to the `useResponsive` hook and full support for light/dark mode.
* Authentication flow ready for Google Sign-In via `GOOGLE_WEB_CLIENT_ID`.

## 🧱 Stack and Architecture

* **Expo SDK 52** with **React Native 0.82 · React 19** using functional components and hooks.
* **TypeScript** with shared types in `src/types`.
* **React Navigation (stack + bottom tabs)** for multi-module flows.
* **NativeWind/TailwindCSS** for declarative responsive styles.
* **Context API** (`AuthContext`, `ThemeContext`) for global state.
* **Organized HTTP services** in `src/services` for companies, reminders, tasks, and dashboards.

## ✅ Prerequisites

* **Node.js >= 20** and npm (or pnpm/yarn) updated.
* **Expo CLI** (optional, but recommended): `npm install -g expo-cli`
* For native development:
  * **Android**: JDK 17, Android Studio + Android SDK Platform 34
  * **iOS**: Xcode 15.4+ and CocoaPods (macOS only)
* **Expo Go app** (optional, for quick testing on physical devices):
  * [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  * [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🛠️ Quick Setup

1. **Install dependencies**  
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment variables**  
   Create a `.env` file in the project root with the following variables:
   ```env
   GOOGLE_WEB_CLIENT_ID=your_google_client_id_here
   API_BASE_URL=https://api.example.com
   ENABLE_NOTIFICATIONS=true
   SOCKET_URL=ws://localhost:3000
   LOCATION_UPDATE_INTERVAL=5000
   LOCATION_ACCURACY=balanced
   ```
   These are used in `src/config/env.ts`.

3. **Set up the WebSocket server** (for location tracking):
   ```bash
   # Install server dependencies
   npm run server:install
   
   # Start server in development mode
   npm run server:dev
   ```
   See `server/README.md` for detailed server documentation.

3. **Add app assets (optional)**  
   Create an `assets` folder in the project root and add:
   * `icon.png` (1024x1024) - App icon
   * `splash.png` (1284x2778 recommended) - Splash screen
   * `adaptive-icon.png` (1024x1024) - Android adaptive icon
   * `favicon.png` (48x48) - Web favicon
   
   Or update `app.json` to remove asset references if not using them.

4. **Start Expo development server**  
   ```bash
   npm start
   ```
   This will:
   * Start the Metro bundler
   * Display a QR code for Expo Go
   * Open Expo DevTools in your browser

5. **Run the app**  
   
   **Option A: Using Expo Go (Quick Testing)**
   * Install Expo Go on your device
   * Scan the QR code from the terminal
   * The app will load on your device
   
   **Option B: Native Development Build**
   ```bash
   npm run android   # Runs on Android emulator/device
   npm run ios       # Runs on iOS simulator/device
   ```
   
   **Option C: Development Build**
   ```bash
   npx expo run:android
   npx expo run:ios
   ```

## 📦 Available Scripts

* `npm start` · Start Expo development server with Metro bundler
* `npm run android` · Build and run on Android emulator/device
* `npm run ios` · Build and run on iOS simulator/device
* `npm run lint` · Run ESLint to check code quality
* `npm test` · Run Jest test suite
* `npm run generate-icons` · Generate adaptive icons from `scripts/generate-icons.js`
* `npm run build:apk` · Build Android APK and copy to `releases/` folder

### Additional Expo Commands

* `npx expo start --clear` · Start with cleared cache
* `npx expo start --tunnel` · Start with tunnel connection (for testing on devices on different networks)
* `npx expo prebuild` · Generate native iOS/Android projects (if needed)
* `npx expo install <package>` · Install Expo-compatible packages

## 🗂️ Relevant Structure

```
src/
 ├─ components/        # Reusable animations, buttons and modals
 ├─ config/            # Env vars, calendar types
 ├─ context/           # Theme, authentication, and location tracking
 ├─ hooks/             # Responsive design hook
 ├─ navigation/        # Stack + tabs
 ├─ screens/           # Companies, Reminders, PersonalTasks, Dashboard, LiveTracking…
 ├─ services/          # HTTP calls, location tracking, socket communication
 └─ types/             # Shared types

server/                # WebSocket server for location tracking
 ├─ src/              # Server source code
 │  ├─ index.ts       # Main server file
 │  └─ types.ts       # TypeScript types
 ├─ package.json      # Server dependencies
 └─ README.md         # Server documentation
```

## 🔔 Notifications and Reminders

* `notificationsService` creates channels on Android, requests permissions and schedules reminders/tasks using `@notifee/react-native`.
* `CompaniesScreen` and `PersonalTasksScreen` schedule alerts when refreshing data to maintain synchronization even outside the app.
* Adjust notification times and texts directly in `src/services/notificationsService.ts`.
* Notifications work in both Expo Go and development builds, but may require additional configuration for production builds.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Current tests use **Jest** and **@testing-library/react-native**. Add specs in `__tests__/` directories or co-located according to the module structure.

## 📲 Building for Production

### Android APK
```bash
npm run build:apk
```
This produces `releases/MVPNotification-debug.apk`.

### Using EAS Build (Recommended for Production)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

4. **Build for Android**:
   ```bash
   eas build --platform android
   ```

5. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

### Manual iOS Build
Open `ios/MVPNotification.xcworkspace` (or run `npx expo prebuild` first if needed) in Xcode and generate the `MVPNotification` scheme. Make sure to use the same `GOOGLE_WEB_CLIENT_ID` in the corresponding entitlements.

### Development Builds
For development builds with custom native code:
```bash
npx expo run:android --variant debug
npx expo run:ios --configuration Debug
```

## 🐛 Troubleshooting

### Metro Bundler Issues
If you encounter cache or bundler issues:
```bash
npm start -- --clear
# or
npx expo start --clear
```

### Android Build Issues
* Ensure Android SDK and build tools are properly installed
* Check that `ANDROID_HOME` environment variable is set
* Try cleaning the build: `cd android && ./gradlew clean`

### iOS Build Issues
* Run `cd ios && pod install` after installing new dependencies
* Ensure Xcode Command Line Tools are installed: `xcode-select --install`
* Clean build folder in Xcode: Product → Clean Build Folder (⇧⌘K)

### Environment Variables Not Loading
* Ensure `.env` file is in the project root
* Restart Metro bundler after changing `.env` file
* For Expo, you may need to use `expo-constants` or `expo-env` for environment variables

### Notifications Not Working
* Check that permissions are granted in device settings
* For Android, ensure notification channels are properly configured
* Some notification features may require a development build (not Expo Go)

## 📚 Additional Resources

* [Expo Documentation](https://docs.expo.dev/)
* [React Native Documentation](https://reactnative.dev/)
* [Expo SDK 52 Release Notes](https://expo.dev/changelog/)
* [Notifee Documentation](https://notifee.app/react-native/docs/overview)
* [React Navigation Documentation](https://reactnavigation.org/)

## 📄 License

This project is private and proprietary.

