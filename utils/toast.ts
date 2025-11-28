import Toast from 'react-native-toast-message';
import { t } from '@/i18n';

export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  REQUEST = 'request',
  UNKNOWN = 'unknown',
}

interface ErrorInfo {
  title: string;
  message: string;
}

const getErrorInfo = (type: ErrorType, customMessage?: string): ErrorInfo => {
  const basePath = `errors.${type}`;
  
  return {
    title: t(`${basePath}.title`),
    message: customMessage || t(`${basePath}.message`),
  };
};

export const showErrorToast = (
  type: ErrorType,
  customMessage?: string
) => {
  const errorInfo = getErrorInfo(type, customMessage);
  
  Toast.show({
    type: 'error',
    text1: errorInfo.title,
    text2: errorInfo.message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showInfoToast = (message: string) => {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

// Helper to determine error type from axios error
export const getErrorType = (error: any): ErrorType => {
  // Network error (no response from server)
  if (!error.response) {
    // Check if it's a network connectivity issue
    if (error.message?.includes('Network Error') || 
        error.message?.includes('network') ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNABORTED') {
      return ErrorType.NETWORK;
    }
    return ErrorType.UNKNOWN;
  }

  // Server error (5xx)
  if (error.response.status >= 500) {
    return ErrorType.SERVER;
  }

  // Client error (4xx) - but server responded
  if (error.response.status >= 400) {
    return ErrorType.REQUEST;
  }

  return ErrorType.UNKNOWN;
};

