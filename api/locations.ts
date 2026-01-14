import { getErrorType, showErrorToast } from '@/utils/toast';
import apiClient from './client';

export interface LocationSearchResult {
  id: string;
  display_name: string;
  lat: number;
  lon: number;
  place_id: string;
  address: {
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  osm_type?: string;
  osm_id?: number;
}

export interface UserLocation {
  location_id: number;
  lat: number;
  lon: number;
  location: {
    lat: number;
    lon: number;
    display_name: string;
    address: {
      neighbourhood?: string;
      suburb?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    place_id?: string;
    osm_type?: string;
    osm_id?: number;
  };
  nominatim_place_id?: string;
}

export interface SaveLocationData {
  lat: number;
  lon: number;
  place_id?: string;
  display_name?: string;
  address_components?: {
    neighbourhood?: string;
    city?: string;
    [key: string]: any;
  };
}

/**
 * Search for locations using predictive search
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

    const response = await apiClient.get(`/locations/search?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error searching locations:', error);
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
export const saveUserLocation = async (
  locationData: SaveLocationData
): Promise<UserLocation> => {
  try {
    const response = await apiClient.post('/user/location', locationData);
    return response.data;
  } catch (error: any) {
    console.error('Error saving user location:', error);
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
    // 404 means no location is set, which is expected
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching user location:', error);
    const errorType = getErrorType(error);
    // Commented out showErrorToast in an error that should fail silently.
    // showErrorToast(errorType);
    // We don't throw an error, the user has never had their location set.
    throw error;
  }
};
