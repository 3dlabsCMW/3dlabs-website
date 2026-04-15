# 3DLabs Internal App (Expo + Firebase MVP)

## 1) Short Summary
A practical MVP mobile app for internal operations at 3DLabs, built with Expo + React Native + TypeScript. It includes shared schedules, shared tasks, announcements, and admin-only team management, with Firebase Auth + Firestore real-time sync as the source of truth.

## 2) Folder Structure

```text
3dlabs-app/
  src/
    components/
    screens/
    navigation/
    services/
    hooks/
    types/
    utils/
    firebase/
    constants/
    App.tsx
  firebase/
    firestore.rules
  .env.example
  app.json
  package.json
  tsconfig.json
  index.ts
```

## 3) Firestore Data Structure / Collections

### `users/{uid}`
- name: string
- email: string
- phone?: string
- role: `admin | team`
- status: `active | inactive`
- createdAt: timestamp
- updatedAt: timestamp

### `scheduleItems/{id}`
- title: string
- date: string (`YYYY-MM-DD`)
- startTime: string (`HH:mm`)
- endTime?: string
- notes?: string
- assignedUserIds: string[]
- location?: string
- category: `meeting | job | reminder | deadline`
- status: `scheduled | completed | cancelled`
- createdBy: user uid
- createdAt, updatedAt

### `tasks/{id}`
- title: string
- description?: string
- dueDate?: string
- priority: `low | medium | high`
- assignedUserIds: string[]
- status: `todo | in_progress | done`
- createdBy: user uid
- createdAt, updatedAt

### `announcements/{id}`
- title: string
- message: string
- createdBy: user uid
- createdAt

## 4) Firebase Auth + Permissions Approach
- Firebase Auth handles sign-in.
- `users/{uid}` holds business role and active status.
- App UI checks role to show/hide admin screens/actions.
- Firestore rules enforce role-based access server-side (real security).

## 5) Firebase Security Rules
Use `firebase/firestore.rules` from this project. Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## 6) MVP Code (Main Files)
Main implementation is in:
- `src/App.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/screens/*`
- `src/services/authService.ts`
- `src/services/firestoreService.ts`
- `src/hooks/*`
- `src/utils/calendar.ts`
- `src/utils/notifications.ts`
- `firebase/firestore.rules`

## 7) Setup Instructions
1. Create a Firebase project.
2. Enable Authentication (Email/Password).
3. Create Firestore database in production mode.
4. Copy `.env.example` to `.env` and fill Firebase values.
5. Seed first admin user doc with same UID as your auth user and role `admin`.
6. Deploy Firestore rules.

## 8) Environment Variables
See `.env.example`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## 9) Simplest Steps to Run Locally
```bash
cd 3dlabs-app
npm install
npx expo start
```
Then scan QR code with:
- **iPhone**: Expo Go app
- **Android**: Expo Go app

## 10) Simplest Steps to Install/Test on iPhone + Android

### Fastest early testing (recommended)
- Use Expo Go with `npx expo start` and QR code sharing.

### More realistic internal test builds
1. Install EAS CLI: `npm i -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build iOS internal test: `eas build -p ios --profile preview`
5. Build Android internal test: `eas build -p android --profile preview`
6. Share generated install links with team.

### Later App Store style flow
- iOS: distribute via TestFlight from EAS/Apple workflow.
- Android: share internal APK/AAB links via EAS distribution.

## 11) How Live Sync Works
- Each feature uses Firestore `onSnapshot` listeners.
- When any user creates/updates docs, all subscribed clients receive updates almost immediately.
- Firestore is the source of truth.
- Offline caching is naturally provided by Firebase SDK behavior in mobile usage.

## Notes on notifications in MVP
- Notification permission registration is wired.
- Local reminder helper is included (`src/utils/notifications.ts`).
- For production push to all users on new announcement or reminders, add a lightweight Firebase Cloud Function trigger later.

