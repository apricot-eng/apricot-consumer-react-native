# Development Build Setup Guide

## Overview

Since MapLibre React Native requires native code, you cannot use Expo Go. You need to create development builds instead. This guide covers the setup process.

## Current Status

✅ **Completed:**
- EAS CLI installed globally
- iOS native project generated (`ios/` folder)
- Android native project generated (`android/` folder)
- CocoaPods installed via Homebrew

⚠️ **Requires Manual Setup:**
- Xcode installation and configuration (for iOS)
- Android Studio installation and configuration (for Android)
- iOS dependencies installation (requires Xcode)
- Building and testing the development builds

## Prerequisites

### For iOS Development

1. **Install Xcode** (Required)
   - Download from Mac App Store (free, ~12GB)
   - Open Xcode at least once to accept license
   - Install Command Line Tools: `xcode-select --install`
   - Accept Xcode license: `sudo xcodebuild -license accept`

2. **CocoaPods** (Already installed via Homebrew)
   - Verify: `pod --version`
   - Should show: `1.16.2` or similar

3. **iOS Simulator** (Comes with Xcode)
   - Open Xcode → Settings → Platforms
   - Download desired iOS simulator version

### For Android Development

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK, SDK Platform, and Android Virtual Device (AVD)

2. **Configure Android Environment**
   - Set `ANDROID_HOME` environment variable in your shell profile:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     ```
   - Create Android Virtual Device (AVD) for emulator

3. **Java Development Kit (JDK)**
   - Android Studio includes JDK, or install separately

## Next Steps

### iOS Setup

1. **Install iOS Dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```
   Note: This requires Xcode to be installed and configured.

2. **Build and Run iOS Development Build**
   ```bash
   npx expo run:ios
   ```
   This will:
   - Build the iOS app
   - Launch iOS Simulator
   - Install the development build
   - Start the Metro bundler

### Android Setup

1. **Build and Run Android Development Build**
   ```bash
   npx expo run:android
   ```
   This will:
   - Build the Android app
   - Launch Android Emulator (or use connected device)
   - Install the development build
   - Start the Metro bundler

## Development Workflow

### Starting the Development Server

After building the development build, use:

```bash
npx expo start --dev-client
```

This connects to your development build instead of Expo Go. The QR code will work with your development build installed on a device.

### Hot Reload

Hot reload and fast refresh work the same as Expo Go. Changes to your code will automatically reflect in the app.

## Troubleshooting

### iOS Issues

**Problem:** `pod install` fails with encoding errors
- **Solution:** Set UTF-8 encoding in your terminal:
  ```bash
  export LANG=en_US.UTF-8
  ```
  Add this to your `~/.zshrc` or `~/.bash_profile`

**Problem:** `xcodebuild` requires Xcode
- **Solution:** Install Xcode from Mac App Store and configure it:
  ```bash
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  ```

**Problem:** CocoaPods installation issues
- **Solution:** CocoaPods is already installed via Homebrew. If you need to reinstall:
  ```bash
  brew install cocoapods
  ```

### Android Issues

**Problem:** Android SDK not found
- **Solution:** Set `ANDROID_HOME` environment variable (see Android Setup above)

**Problem:** No Android devices/emulators found
- **Solution:** 
  - Start Android Studio
  - Open AVD Manager
  - Create and start an Android Virtual Device

### General Issues

**Problem:** Metro bundler cache issues
- **Solution:** Clear cache and restart:
  ```bash
  npx expo start -c
  ```

**Problem:** Native module not found
- **Solution:** Rebuild the development build after adding new native modules:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios  # or run:android
  ```

## Alternative: EAS Build (Cloud-based)

If local builds become problematic, you can use EAS Build:

1. **Install EAS CLI** (Already done)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Create EAS Build Configuration**
   ```bash
   eas build:configure
   ```

4. **Build Development Build**
   ```bash
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```

5. **Install on Device**
   - Download the build from the EAS dashboard
   - Install on your device
   - Use `npx expo start --dev-client` to connect

**Advantages:**
- No local Xcode/Android Studio needed
- Builds run in the cloud
- Can build for both platforms from any machine

**Disadvantages:**
- Slower iteration (builds take 10-20 minutes)
- Requires Expo account (free tier available)
- Requires internet connection

## Testing MapLibre

Once you have a development build running:

1. Navigate to the location screen
2. Verify the map renders correctly
3. Test map interactions (pinch to zoom, pan)
4. Verify store pins appear on the map
5. Test location search functionality
6. Test current location button
7. Test location selection and saving

## Notes

- First build will take longer (10-30 minutes) as it compiles native code
- Subsequent builds are faster with incremental compilation
- Development builds can be installed on physical devices via USB
- You can still use Expo Go for screens that don't require native modules
- The `ios/` and `android/` folders are gitignored (as they should be)

## Quick Reference Commands

```bash
# Generate native projects
npx expo prebuild

# Generate iOS only
npx expo prebuild --platform ios

# Generate Android only
npx expo prebuild --platform android

# Install iOS dependencies (requires Xcode)
cd ios && pod install && cd ..

# Build and run iOS
npx expo run:ios

# Build and run Android
npx expo run:android

# Start dev server for development build
npx expo start --dev-client

# Clear cache and start
npx expo start -c --dev-client
```




