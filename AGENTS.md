# AGENTS.md - Apricot React Native

Guidelines for AI coding agents working in this React Native (Expo) codebase.

## Build/Lint/Test Commands

```bash
# Development
npm run start              # Start Expo dev server
npm run ios                # Run iOS development build
npm run android            # Run Android development build

# Linting
npm run lint               # Run ESLint (expo lint)

# Testing
npm run test               # Run all tests with Jest
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test -- path/to/file.test.tsx    # Run single test file
npx jest path/to/file.test.tsx --watch   # Watch single test file
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled - always type function parameters and return types
- Use interfaces for object shapes, `type` for unions/intersections
- Path alias: `@/*` maps to project root
- Never use `any` unless absolutely necessary

### Naming Conventions
- Components: PascalCase (e.g., `LocationScreen.tsx`)
- Files: Match component name or kebab-case for utilities
- Hooks: Start with `use` prefix (e.g., `useUserLocation.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_CENTER`)
- TSX files always start with uppercase letter (except `_layout.tsx`)

### Imports
- Use path aliases: `@/api/stores`, `@/utils/logger`
- Group imports: React/Expo → third-party → local (@/)
- Example:
```typescript
import { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { getStoresNearby } from '@/api/stores';
import { logger } from '@/utils/logger';
```

### React Components
- Use functional components with hooks (no class components)
- Screen components: `export default function`
- Reusable components: named exports
- Use `useCallback` and `useMemo` for performance
- Use `useFocusEffect` from expo-router for screen focus events

### Styling
- Use `StyleSheet.create()` from React Native
- Store styles in separate `.styles.ts` files in `/styles` directory
- Mirror component file structure in styles directory
- Use themed components (`ThemedView`, `ThemedText`) when appropriate
- Colors come from `constants/theme.ts` (FigmaColors or Colors)
- Never hardcode colors - use theme constants

### API Calls
- Always use `apiClient` from `/api/client.ts` (not raw axios)
- API functions organized by domain in `/api` directory
- Wrap API calls in try-catch blocks
- Handle errors and loading states
- Use TypeScript interfaces for API response types

### Error Handling
- Always wrap API calls in try-catch
- Show user-friendly errors via toast (`/utils/toast.ts`)
- Log errors using logger utility
- Handle missing/null API fields gracefully with optional chaining (`?.`)
- Provide fallback values: `value ?? defaultValue`

### Logging
- Use `logger` utility from `/utils/logger.ts` (never `console.log`)
- Environment variables control logging:
  - `EXPO_PUBLIC_LOG_ENABLED` - Enable/disable
  - `EXPO_PUBLIC_LOG_VERBOSE` - Verbose API logging
  - `EXPO_PUBLIC_LOG_LEVEL` - debug, info, warn, error
- Use `logger.api.request()`, `logger.api.response()`, `logger.api.error()`

### Internationalization
- Use `t()` function from `/i18n` for all user-facing strings
- Add translations to `/i18n/translations.ts`
- Never hardcode Spanish text

### Currency Formatting
- Use currency utility from `/utils/currency.ts`
- Format: Argentine peso with dot as thousands separator (e.g., "$2.300")

### Function Size Guidelines
- `/utils`: ~3-10 lines (small, pure functions)
- `/api`, `/hooks`, `/contexts`: ~10-30 lines
- Screens/Orchestration: ~20-50 lines
- Refactor if function name contains `and`, `or`, `then`

### Testing
- Tests located in `__tests__` directories alongside source files
- Use `@testing-library/react-native` for component tests
- Mock external dependencies (API, AsyncStorage, logger)
- Follow existing test patterns in `hooks/__tests__/`

### What NOT To Do
- Don't use `console.log` - use logger utility
- Don't make direct axios calls - use apiClient
- Don't hardcode strings - use i18n translations
- Don't hardcode colors - use theme constants
- Don't bypass error handling
- Don't use class components
- Don't ignore TypeScript errors
- Don't add styles inside TSX files - use `/styles` directory

## Project Structure

```
/app              - Expo Router screens (file-based routing)
/api              - API client functions (client.ts, stores.ts, etc.)
/components       - Reusable React components
/config           - Configuration files
/constants        - App constants (theme colors, location defaults)
/contexts         - React Context providers
/hooks            - Custom React hooks
/styles           - StyleSheet definitions (mirrors app structure)
/utils            - Utility functions (logger, toast, currency, etc.)
/i18n             - Internationalization (translations)
```

## Development Notes

- This app requires a development build (cannot use Expo Go) due to MapLibre
- Run `npx expo run:ios` or `npx expo run:android` for native builds
- Start dev server with `npx expo start --dev-client`
- Default map center: Buenos Aires (-34.5912554, -58.4280328)
- API base URL configured in `/config/api.ts`
