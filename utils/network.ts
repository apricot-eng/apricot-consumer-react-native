import NetInfo from '@react-native-community/netinfo';

/**
 * Network connectivity utility for detecting connection status
 * Distinguishes between:
 * - Device offline (no internet connection)
 * - Server unreachable (device has internet but can't reach our backend)
 */

export type ConnectionErrorType = 'offline' | 'server_unreachable';

/**
 * Check if device has internet connectivity
 * Uses NetInfo to check both connection status and internet reachability
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  const netState = await NetInfo.fetch();
  return netState.isConnected === true && netState.isInternetReachable === true;
};

/**
 * Determine the type of connection error
 * @param error - The axios error object
 * @returns 'offline' if device has no internet
 * @returns 'server_unreachable' if device has internet but request failed with no response
 * @returns null if it's not a connection error (server responded)
 */
export const getConnectionErrorType = async (error: any): Promise<ConnectionErrorType | null> => {
  // If we got a response from server, it's not a connection error
  if (error.response) {
    return null;
  }

  // Check actual device connectivity
  const hasInternet = await checkInternetConnection();

  if (!hasInternet) {
    return 'offline'; // No internet connection
  }

  // Device has internet but request failed without response
  // This means server is unreachable (down, DNS issue, firewall, etc.)
  // Common axios error codes for network failures:
  // - ERR_NETWORK: General network error
  // - ECONNABORTED: Request timeout
  // - ECONNREFUSED: Server refused connection
  // - ENOTFOUND: DNS lookup failed
  if (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    !error.response
  ) {
    return 'server_unreachable';
  }

  return null;
};

/**
 * Check if an error is a timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};
