# Translation and Error Handling Setup

## Installation Required

Before running the app, install the required package:

```bash
npm install react-native-toast-message
```

## Translation System

The app now uses a translation system located in `i18n/`:

- **`i18n/translations.ts`** - Contains all translation strings for Spanish (es) and English (en)
- **`i18n/index.ts`** - Translation utility functions (`t()` function)

### Current Language

The app is set to Spanish by default. To change the language, use:

```typescript
import { setLanguage } from '@/i18n';

setLanguage('en'); // Switch to English
setLanguage('es'); // Switch to Spanish
```

### Using Translations

Import and use the `t()` function:

```typescript
import { t } from '@/i18n';

const text = t('navigation.inicio'); // Returns "Inicio" in Spanish
```

## Error Handling with Toast Messages

All API errors are now handled using `react-native-toast-message` with user-friendly messages in Spanish.

### Error Types

The system differentiates between:

1. **Network Errors** - No internet connection
   - Message: "Sin conexión a internet"
   - Details: "No estás conectado a internet. Por favor, verifica tu conexión e intenta nuevamente."

2. **Server Errors** - Server is down (5xx errors)
   - Message: "Error del servidor"
   - Details: "Estamos teniendo problemas en este momento. Por favor, intenta más tarde."

3. **Request Errors** - Client errors (4xx errors)
   - Message: "Error en la solicitud"
   - Details: "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente."

4. **Unknown Errors** - Other errors
   - Message: "Error desconocido"
   - Details: "Ocurrió un error inesperado. Por favor, intenta nuevamente."

### Toast Utility

Located in `utils/toast.ts`:

- `showErrorToast(type, customMessage?)` - Show error toast
- `showSuccessToast(message)` - Show success toast
- `showInfoToast(message)` - Show info toast
- `getErrorType(error)` - Automatically determine error type from axios error

### Usage in API Calls

The API functions (`api/surpriseBags.ts`) automatically show toast messages when errors occur. No need to manually handle toasts in components - they're shown automatically.

## Updated Files

All screens and components have been updated to use translations:

- ✅ `app/(tabs)/index.tsx` - Inicio screen
- ✅ `app/(tabs)/orders.tsx` - Orders placeholder
- ✅ `app/(tabs)/favourites.tsx` - Favourites placeholder
- ✅ `app/(tabs)/profile.tsx` - Profile placeholder
- ✅ `app/(tabs)/_layout.tsx` - Tab navigation
- ✅ `app/surprise-bag-details.tsx` - Details screen
- ✅ `components/SurpriseBagCard.tsx` - Card component
- ✅ `api/surpriseBags.ts` - API functions with toast error handling
- ✅ `app/_layout.tsx` - Root layout with Toast component

## Adding New Translations

To add new translation strings:

1. Add the key to `i18n/translations.ts` in both `es` and `en` objects
2. Use `t('your.key.path')` in your components

Example:

```typescript
// In i18n/translations.ts
export const translations = {
  es: {
    myFeature: {
      title: 'Mi Título',
      description: 'Mi descripción',
    },
  },
  en: {
    myFeature: {
      title: 'My Title',
      description: 'My description',
    },
  },
};

// In component
const title = t('myFeature.title');
```

