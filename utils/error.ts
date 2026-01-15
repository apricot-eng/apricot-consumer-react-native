import { logger } from './logger';

export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  REQUEST = 'request',
  UNKNOWN = 'unknown',
}

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
    logger.debug('ERROR_UTIL', 'getErrorType unknown error', error);
    // TODO: handle this error better. Map Bounds error gets caught here.
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
