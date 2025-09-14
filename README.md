# HopHacks App 🎉

A React Native mobile application built with Expo for managing events, groups, and social activities.

## Prerequisites

Before running this app, make sure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (will be installed via npx)
- Expo Go app on your mobile device

## Getting Started

Follow these steps to run the app on your device:

### 1. Navigate to the project directory
```bash
cd hophacks-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

You need to configure the following environment secrets for Supabase integration:

Create a `.env` file in the root directory and add:
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_API_KEY=your_supabase_api_key_here
```

**Important**: Make sure to replace the placeholder values with your actual Supabase credentials.

### 4. Start the development server
```bash
npx expo start --tunnel
```

The `--tunnel` flag creates a tunnel connection that allows you to test the app on your physical device from anywhere.

### 5. Install Expo Go on your phone

- **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store
- **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play Store

### 6. Scan the QR code

Once the development server starts, you'll see a QR code in your terminal. Open the Expo Go app on your phone and scan this QR code to load the app.

## Project Structure

This app uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. Key directories include:

- `app/` - Main application screens and routing
- `components/` - Reusable React components
- `lib/` - Utility functions and services (API, auth, Supabase)
- `constants/` - App constants and configuration
- `assets/` - Images and other static assets

## Key Features

- Event management and discovery
- Group creation and management
- User profiles and authentication
- Activity feeds and leaderboards
- QR code scanning for events
- Real-time updates with Supabase

## Available Scripts

- `npm start` - Start the development server
- `npm run android` - Start for Android emulator
- `npm run ios` - Start for iOS simulator
- `npm run web` - Start for web browser
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Testing on Different Platforms

### Physical Device (Recommended)
Use the steps above with Expo Go for the best development experience.

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web Browser
```bash
npm run web
```

## Troubleshooting

### Common Issues

1. **QR Code not scanning**: Make sure your phone and computer are on the same network, or use the `--tunnel` flag
2. **Metro bundler issues**: Try clearing the cache with `npx expo start --clear`
3. **Environment variables not loading**: Restart the development server after adding `.env` file
4. **Supabase connection issues**: Verify your Supabase URL and API key are correct

### Need Help?

If you encounter any issues:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Visit the [Expo community forum](https://forums.expo.dev/)
3. Join the [Expo Discord](https://chat.expo.dev/)

## Development

This project was created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and uses:
- React Native with Expo SDK 54
- TypeScript for type safety
- Supabase for backend services
- Expo Router for navigation
- Custom components for UI consistency

Start developing by editing files in the `app/` directory!

## Acknowledgments

Made for HopHacks 2025
BY:
- Vijay Nannapuraju
- Rakshith Raja