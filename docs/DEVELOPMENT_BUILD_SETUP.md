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

3. **Java Development Kit (JDK)** (Required)
   
   Android builds require Java Development Kit. **Recommended: Use Android Studio's bundled JDK** (easiest option).
   
   **Option 1: Use Android Studio's JDK (Recommended)**
   
   Android Studio includes a JDK. Configure your system to use it:
   
   ```bash
   # Add to your shell profile (~/.zshrc for zsh or ~/.bash_profile for bash)
   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
   export PATH="$JAVA_HOME/bin:$PATH"
   ```
   
   Then reload your shell configuration:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```
   
   Verify installation:
   ```bash
   java -version
   javac -version
   ```
   
   You should see Java version information. If the path doesn't work, try:
   ```bash
   export JAVA_HOME="$HOME/Library/Android/sdk/jre"
   ```
   
   **Option 2: Install JDK via Homebrew (Alternative)**
   
   If you prefer a standalone JDK installation:
   
   ```bash
   # Install JDK 17 (recommended for Android development)
   brew install openjdk@17
   
   # Link the JDK
   sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
   
   # Add to your shell profile
   echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
   echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
   
   # Reload your shell configuration
   source ~/.zshrc
   ```
   
   Verify installation:
   ```bash
   java -version
   javac -version
   ```

4. **Gradle Version** (Required)
   
   Expo SDK 54 requires **Gradle 8.14.3** (not Gradle 9). Gradle 9 is not compatible with React Native 0.81.5.
   
   The Gradle version is configured in `android/gradle/wrapper/gradle-wrapper.properties`. If you encounter Gradle compatibility errors:
   
   - Check your current Gradle version: `cd android && ./gradlew --version`
   - Edit `android/gradle/wrapper/gradle-wrapper.properties` and ensure it uses:
     ```properties
     distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
     ```
   - Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx expo run:android`

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

**Problem:** Android SDK not found or "SDK location not found"
- **Solution:** 
  - **Option 1 (Recommended):** Create `android/local.properties` file:
    ```bash
    echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
    ```
    If your Android SDK is in a different location, find it in Android Studio: Preferences → Appearance & Behavior → System Settings → Android SDK
  - **Option 2:** Set `ANDROID_HOME` environment variable in your shell profile (see Android Setup above)
  - Verify the SDK path exists: `ls $HOME/Library/Android/sdk`

**Problem:** No Android devices/emulators found
- **Solution:** 
  - Start Android Studio
  - Open AVD Manager
  - Create and start an Android Virtual Device

**Problem:** "Unable to locate a Java Runtime" or "The operation couldn't be completed. Unable to locate a Java Runtime."
- **Solution:** 
  - Install and configure JDK (see Java Development Kit section above)
  - Make sure `JAVA_HOME` is set correctly in your shell profile
  - Verify with: `java -version` and `echo $JAVA_HOME`
  - If using Android Studio's JDK, ensure the path `/Applications/Android Studio.app/Contents/jbr/Contents/Home` exists
  - Restart your terminal after setting environment variables

**Problem:** Gradle 9 compatibility errors or build failures
- **Solution:** 
  - Expo SDK 54 requires Gradle 8.14.3, not Gradle 9
  - Edit `android/gradle/wrapper/gradle-wrapper.properties`:
    ```properties
    distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
    ```
  - Clean the project: `cd android && ./gradlew clean && cd ..`
  - Rebuild: `npx expo run:android`

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





