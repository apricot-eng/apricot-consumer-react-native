import { Address, Coordinates, LocationData, NominatimMetadata } from '@/types/location';
import { getErrorType } from '@/utils/error';
import { logger } from '@/utils/logger';
import { showErrorToast } from '@/utils/toast';
import apiClient from './client';

export interface LocationSearchResult extends Coordinates, NominatimMetadata {
  id: string;
  address: Address;
}
export interface UserLocation extends Coordinates {
  location_id: number;

  location: Coordinates & NominatimMetadata & {
    display_name: string;
    address: Address;
  };

  nominatim_place_id?: string;
}


/**
 * Search for locations using predictive search
 * Results are restricted to Argentina only.
 * @param query - Search query (e.g., "Palermo", "Av. Santa Fe 123")
 * @param limit - Maximum number of results (default: 10, max: 20)
 * @returns Array of location search results
 */
export const searchLocations = async (
  query: string,
  limit: number = 10
): Promise<LocationSearchResult[]> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) {
      params.append('limit', limit.toString());
    }
    // Restrict results to Argentina only
    params.append('countrycodes', 'ar');

    const response = await apiClient.get(`/locations/search?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    logger.error('LOCATIONS_API', 'Error searching locations', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    throw error;
  }
};

/**
 * Save the authenticated user's selected location
 * @param locationData - Location data to save
 * @returns Saved user location
 */
export const saveUserLocationApi = async (
  locationData: LocationData
): Promise<UserLocation> => {
  try {
    const response = await apiClient.post('/user/location', locationData);
    return response.data;
  } catch (error: any) {
    const code = error.response?.status;
    // 401 means user is a guest (not authenticated) - fail silently
    if (code === 401) {
      // Return a promise that resolves to null or throw a silent error
      // Since this is a save operation, we'll throw but silently
      throw error;
    }
    // For other errors, log and show toast
    logger.error('LOCATIONS_API', 'Error saving user location', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    throw error;
  }
};

/**
 * Get the authenticated user's saved location
 * @returns User location or null if not set
 */
export const getUserLocation = async (): Promise<UserLocation | null> => {
  try {
    const response = await apiClient.get('/user/location');
    return response.data;
  } catch (error: any) {
    const code = error.response?.status;
    // 404 means no location is set, which is expected
    if (code === 404) {
      return null;
    }
    // 401 means user is a guest (not authenticated) - fail silently
    if (code === 401) {
      return null;
    }
    // For other errors, log and throw
    logger.error('LOCATIONS_API', 'Error fetching user location', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    throw error;
  }
};
