# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. **Important: Development Build Required**

   This app uses MapLibre React Native, which requires native code. You **cannot** use Expo Go. You need to create a development build instead.

   See [Development Build Setup Guide](./docs/DEVELOPMENT_BUILD_SETUP.md) for detailed instructions.

   **Quick start:**
   - For iOS: Install Xcode, then run `npx expo run:ios`
   - For Android: Install Android Studio, then run `npx expo run:android`

3. Start the development server

   ```bash
   npx expo start --dev-client
   ```

   This connects to your development build instead of Expo Go.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Logging

The app includes a configurable logging system for debugging API calls and errors. Logs appear in:
- **Expo Dev Tools**: When running `npx expo start --dev-client`
- **Xcode Console**: When running on iOS simulator
- **Metro Bundler**: In the terminal where Expo is running

### Configuration

Logging can be controlled via environment variables (create a `.env` file in the project root):

```bash
# Enable/disable logging (default: true in dev)
EXPO_PUBLIC_LOG_ENABLED=true

# Enable verbose logging - shows API requests/responses with full JSON (default: true in dev)
EXPO_PUBLIC_LOG_VERBOSE=true

# Log level: 'debug', 'info', 'warn', or 'error' (default: 'debug')
EXPO_PUBLIC_LOG_LEVEL=debug
```

Verbose logging automatically shows:
- All API requests with headers, params, and body
- All API responses with status, headers, and JSON data
- Detailed error information including response data

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
