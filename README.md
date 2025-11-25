# MVP Notification

Mobile application in **React Native + TypeScript** for comprehensive management of companies, personal tasks, and tax reminders. MVP Notification centralizes critical information, synchronizes local notifications, and provides visual tools to prioritize deadlines and commitments.

## 🚀 Main Features

* Company panels with key metrics (pending, overdue, upcoming) and advanced filters.
* Reminder management with integration to local notification channels using `@notifee/react-native`.
* Configurable business calendars and automatic event synchronization.
* Personal tasks module with recurrences, priorities, states, and minute-by-minute alerts.
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

* Node.js >= 20 and npm (or pnpm/yarn) updated.
* JDK 17, Android Studio + Android SDK Platform 34.
* Xcode 15.4+ and CocoaPods (macOS/iOS only).
* Configured device or emulator, as well as Watchman and Ruby Bundler optionally.

## 🛠️ Quick Setup

1. **Install dependencies**  
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment variables**  
   * Create a `.env` file in the project root.
   * Define `GOOGLE_WEB_CLIENT_ID` (used in `src/config/env.ts`).

3. **Add app assets (optional)**  
   * Create an `assets` folder in the project root.
   * Add `icon.png`, `splash.png`, `adaptive-icon.png`, and `favicon.png` as needed.
   * Or update `app.json` to remove asset references if not using them.

4. **Start Expo**  
   ```bash
   npm start
   # This will start the Expo development server
   ```

5. **Run the app**  
   ```bash
   npm run android   # Runs on Android emulator/device
   npm run ios       # Runs on iOS simulator/device
   # Or use Expo Go app: scan QR code from the terminal
   ```

## 📦 Available Scripts

* `npm start` · Start Expo development server.
* `npm run android` / `npm run ios` · Compile and deploy to emulator/device using Expo.
* `npm run lint` · Run ESLint.
* `npm test` · Run Jest.
* `npm run generate-icons` · Generate adaptive icons from `scripts/generate-icons.js`.
* `npm run build:apk` · Package and copy a `MVPNotification-debug.apk` inside `releases/`.

## 🗂️ Relevant Structure

```
src/
 ├─ components/        # Reusable animations, buttons and modals
 ├─ config/            # Env vars, calendar types
 ├─ context/           # Theme and authentication
 ├─ hooks/             # Responsive design hook
 ├─ navigation/        # Stack + tabs
 ├─ screens/           # Companies, Reminders, PersonalTasks, Dashboard…
 ├─ services/          # HTTP calls and synchronization logic
 └─ types/             # Shared types
```

## 🔔 Notifications and Reminders

* `notificationsService` creates channels on Android, requests permissions and schedules reminders/tasks.
* `CompaniesScreen` and `PersonalTasksScreen` schedule alerts when refreshing data to maintain synchronization even outside the app.
* Adjust notification times and texts directly in `src/services/notificationsService.ts`.

## 🧪 Testing

```bash
npm test
```

Current tests use Jest and `@testing-library/react-native`. Add specs in `__tests__/` or co-located according to the module.

## 📲 Build APK / IPA

* **Android**: `npm run build:apk` produces `releases/MVPNotification-debug.apk`.
* **iOS**: open `ios/MVPNotification.xcworkspace` and generate the `MVPNotification` scheme from Xcode (use the same `GOOGLE_WEB_CLIENT_ID` in the corresponding entitlements).

