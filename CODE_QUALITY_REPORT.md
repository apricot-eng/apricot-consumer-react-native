# Code Quality Report

This report summarizes the findings from a codebase investigation conducted on the Apricot React Native project, focusing on coding practices and patterns within the `app/**` directory.

## Summary of Findings

The investigation revealed several critical and common issues that impact the maintainability, security, and overall quality of the codebase.

### Critical Issues

*   **Security Vulnerability (Hardcoded API Key):** A hardcoded MapTiler API key was identified in `app/LocationScreen.tsx`. This is a significant security risk as sensitive information should never be directly embedded in source code. This has been addressed by moving the key to an environment variable.
*   **"God Component" Anti-Pattern:** The `app/LocationScreen.tsx` component is overly complex. It mixes UI logic with extensive data fetching, state management (including manual debouncing and caching), and business logic. This violates the Single Responsibility Principle, making the component difficult to read, test, and maintain.

### Common Red Flags

*   **Lack of Separation of Concerns:** Logic related to data fetching, caching, and authentication is frequently intermingled directly within UI components (e.g., `app/SurpriseBagDetailsScreen.tsx` and `app/LocationScreen.tsx`). This leads to tightly coupled code and makes it challenging to reuse logic or test components in isolation.
    *   **Recommendation:** Abstract data fetching and complex business logic into custom hooks or a dedicated service layer. Consider using a state management library (e.g., React Query/TanStack Query) to handle data fetching, caching, and synchronization more robustly and with less boilerplate.
*   **Inconsistent Styling:** While `FigmaColors` are used in some places, `app/LocationScreen.styles.ts` (and potentially other style files) contains numerous hardcoded color values and font sizes (e.g., `'#666'`, `'#ff6b6b'`, `fontSize: 12`). This inconsistency makes global theme changes difficult and compromises the application's visual uniformity.
    *   **Recommendation:** Centralize all styling parameters (colors, fonts, spacing) within `constants/theme.ts` or a similar dedicated theme file, and enforce their use throughout the application.
*   **Bypassed Type Safety:** The use of `as any` for navigation (e.g., `router.push('/main_navigation/IndexScreen' as any)` in `app/ModalScreen.tsx`) circumvents TypeScript's type-checking mechanism. This can hide potential runtime errors related to incorrect route names or parameters.
    *   **Recommendation:** Ensure all navigation paths and parameters are strongly typed. Expo Router often provides ways to infer types or define them to prevent such bypasses.
*   **Incomplete Features and Placeholders:** Several components include `TODO` comments and display placeholder text or logic (e.g., "Implement favorites API" in `SurpriseBagDetailsScreen.tsx`, `t('placeholders.underDevelopment')` in tab screens). While common during development, these should be systematically tracked and resolved.
*   **Hardcoded Values:** Besides the API key, other hardcoded values were observed (e.g., `DEFAULT_CENTER`, `DEFAULT_ZOOM` in `app/LocationScreen.tsx`), which might be better managed as configuration constants if they are subject to change or vary by environment.

## Specific Locations and Examples

*   **`app/LocationScreen.tsx`**:
    *   **"God Component"**: Manages search, map interactions, store fetching, location selection, and saving user location.
    *   **Security Risk**: Hardcoded `MAP_STYLE_URL` with embedded API key (now resolved).
    *   **Manual Logic**: `performSearch` debounce, `fetchStoresForCenter` with custom caching/debouncing logic.
*   **`app/SurpriseBagDetailsScreen.tsx`**:
    *   **Mixed Concerns**: Fetches surprise bag details and store details, including manual `AsyncStorage` check for authentication, directly within `useFocusEffect`.
    *   **Placeholder Data**: `ratingCount` is hardcoded to `(245)`.
*   **`app/ModalScreen.tsx`**:
    *   **Type Safety Issue**: `router.push('/main_navigation/IndexScreen' as any)`
*   **`app/_layout.tsx`**:
    *   **Inconsistent Styling**: `ActivityIndicator` uses hardcoded color `"#794509"` instead of a theme constant.
*   **`app/LocationScreen.styles.ts`**:
    *   **Hardcoded Styles**: Contains numerous direct color strings and font sizes (e.g., `color: '#666'`, `backgroundColor: '#f8f8f8'`) that should ideally reference a centralized theme.

## Recommendations for Future Development

1.  **Enforce Separation of Concerns:** Extract data logic, authentication, and complex business rules into dedicated modules or hooks.
2.  **Utilize State Management Libraries:** Adopt a library like `@tanstack/react-query` for efficient data fetching, caching, and state synchronization.
3.  **Centralize Configuration:** Use environment variables for all sensitive keys and configurable parameters.
4.  **Strict Theming:** Define and enforce a comprehensive design system using `constants/theme.ts` for all colors, fonts, and spacing.
5.  **Strengthen Type Safety:** Eliminate `as any` and leverage TypeScript's capabilities to ensure robust type checking across the application, especially for navigation.
6.  **Regular Code Reviews:** Implement thorough code review processes to catch these patterns early.
7.  **Address TODOs and Placeholders:** Systematically resolve all `TODO` comments and replace placeholder content with actual implementations.
