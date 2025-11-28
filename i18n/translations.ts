export const translations = {
  es: {
    // Common
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      ok: 'OK',
      back: 'Atrás',
      comingSoon: 'Próximamente',
    },
    // Navigation
    navigation: {
      inicio: 'Inicio',
      pedidos: 'Pedidos',
      favoritos: 'Favoritos',
      perfil: 'Perfil',
    },
    // Inicio Screen
    inicio: {
      loading: 'Cargando bolsas sorpresa...',
      empty: 'No hay bolsas sorpresa disponibles',
      location: 'Colegiales, Buenos Aires',
    },
    // Surprise Bag Card
    surpriseBag: {
      quedan: 'Quedan',
      buscar: 'Buscar',
      pesos: 'pesos',
      km: 'km',
    },
    // Placeholder Screens
    placeholders: {
      underDevelopment: 'En desarrollo',
    },
    // Details Screen
    details: {
      title: 'Detalles',
      comingSoon: 'Próximamente',
      comingSoonDescription: 'La página de detalles completa se implementará más adelante.',
    },
    // Error Messages
    errors: {
      network: {
        title: 'Sin conexión a internet',
        message: 'No estás conectado a internet. Por favor, verifica tu conexión e intenta nuevamente.',
      },
      server: {
        title: 'Error del servidor',
        message: 'Estamos teniendo problemas en este momento. Por favor, intenta más tarde.',
      },
      request: {
        title: 'Error en la solicitud',
        message: 'Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.',
      },
      unknown: {
        title: 'Error desconocido',
        message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      },
      loadSurpriseBags: 'Error al cargar las bolsas sorpresa',
      loadDetails: 'Error al cargar los detalles',
      invalidId: 'ID de bolsa sorpresa inválido',
      notFound: 'No se encontró la bolsa sorpresa',
    },
  },
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      ok: 'OK',
      back: 'Back',
      comingSoon: 'Coming Soon',
    },
    // Navigation
    navigation: {
      inicio: 'Home',
      pedidos: 'Orders',
      favoritos: 'Favorites',
      perfil: 'Profile',
    },
    // Inicio Screen
    inicio: {
      loading: 'Loading surprise bags...',
      empty: 'No surprise bags available',
      location: 'Colegiales, Buenos Aires',
    },
    // Surprise Bag Card
    surpriseBag: {
      quedan: 'Left',
      buscar: 'Pick up',
      pesos: 'pesos',
      km: 'km',
    },
    // Placeholder Screens
    placeholders: {
      underDevelopment: 'Under development',
    },
    // Details Screen
    details: {
      title: 'Details',
      comingSoon: 'Coming Soon',
      comingSoonDescription: 'Full details page will be implemented later.',
    },
    // Error Messages
    errors: {
      network: {
        title: 'No internet connection',
        message: 'You are not connected to the internet. Please check your connection and try again.',
      },
      server: {
        title: 'Server error',
        message: 'We are experiencing issues at this time. Please try again later.',
      },
      request: {
        title: 'Request error',
        message: 'There was a problem processing your request. Please try again.',
      },
      unknown: {
        title: 'Unknown error',
        message: 'An unexpected error occurred. Please try again.',
      },
      loadSurpriseBags: 'Error loading surprise bags',
      loadDetails: 'Error loading details',
      invalidId: 'Invalid surprise bag ID',
      notFound: 'Surprise bag not found',
    },
  },
};

export type TranslationKey = keyof typeof translations.es;

