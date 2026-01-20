# GEMINI.md

This file provides a comprehensive overview of the Apricot React Native project, designed to serve as an instructional context for team members and AI assistants.

## Project Overview

This is a React Native mobile application built with Expo and TypeScript. The application allows users to discover and purchase "surprise bags" from local stores. The core functionality revolves around the user's location, displaying available surprise bags in their vicinity.

### Key Technologies

*   **Framework:** React Native with Expo
*   **Language:** TypeScript
*   **Navigation:** Expo Router
*   **State Management:** React Context (`LocationContext`)
*   **API Client:** Axios
*   **Mapping:** MapLibre React Native
*   **Testing:** Jest with React Native Testing Library

### Architecture

The application's architecture is centered around the user's location. A `LocationContext` manages and provides location data throughout the app. It fetches the location from the API, falls back to a cached location, and finally to a default location if necessary.

Navigation is handled by `expo-router`, with a main stack navigator that includes screens for surprise bag details, a modal screen, and a location selection screen. The main screen of the app is a tab navigator with "Index", "Favourites", "Orders" and "Profile" tabs.

API communication is managed by a centralized Axios client, which includes interceptors for request/response logging and attaching authentication tokens.

## Building and Running

This project uses native modules and **cannot be run with the Expo Go app**. You must create a development build to run it on a simulator or a physical device.

### Prerequisites

*   Node.js and npm
*   Xcode (for iOS) or Android Studio (for Android)

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npx expo start --dev-client
    ```

2.  **Run on a simulator or device:**
    *   **iOS:**
        ```bash
        npx expo run:ios
        ```
    *   **Android:**
        ```bash
        npx expo run:android
        ```

### Testing

*   **Run all tests:**
    ```bash
    npm test
    ```
*   **Run tests in watch mode:**
    ```bash
    npm run test:watch
    ```
*   **Generate test coverage report:**
    ```bash
    npm run test:coverage
    ```

### Linting

*   **Run the linter:**
    ```bash
    npm run lint
    ```

## Development Conventions

### Code Style

The project follows standard TypeScript and React conventions. ESLint is configured to enforce code style, and it's recommended to run `npm run lint` before committing changes.

### Logging

The application uses a custom logger for debugging. Logging can be configured via a `.env` file in the project root. See `README.md` for more details on logging configuration.

### Environment Variables

A `.env` file in the project root can be used to configure:
- Logging (`EXPO_PUBLIC_LOG_ENABLED`, `EXPO_PUBLIC_LOG_VERBOSE`, `EXPO_PUBLIC_LOG_LEVEL`)
- API base URL (see `config/api.ts`)

### File-based Routing

The project uses Expo Router's file-based routing. All screens are located in the `app` directory. The main navigation is defined in `app/main_navigation`.

### API Communication

All API requests are managed through the Axios client in `api/client.ts`. When adding new API functions, they should be placed in the relevant file within the `api` directory (e.g., `api/surpriseBags.ts`, `api/locations.ts`).
