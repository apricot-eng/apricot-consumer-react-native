import { getErrorType } from '@/utils/error';
import { logger } from '@/utils/logger';
import { showErrorToast } from '@/utils/toast';
import apiClient from './client';

export interface Store {
  id: number;
  merchant_id?: number;
  store_name: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  logo?: string;
  email?: string;
  owner_name?: string;
  owner_last_name?: string;
  cuit?: string;
  category?: string;
  group?: number;
  neighbourhood?: string;
  latitude?: number;
  longitude?: number;
  map_id?: string;
  approved?: boolean;
  distance?: number; // Distance in kilometers (from nearby endpoint)
  created_at?: string;
  updated_at?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserLocationCoords {
  lat: number;
  long: number;
}

export const getStoreById = async (id: number): Promise<Store> => {
  try {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
  } catch (error: any) {
    logger.error('STORES_API', 'Error fetching store', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw for component error handling
    throw error;
  }
};

/**
 * Get stores nearby a location
 * @param lat - Latitude of the center point
 * @param long - Longitude of the center point
 * @param radiusKm - Search radius in kilometers
 * @returns Array of stores within the radius
 */
export const getStoresNearby = async (
  lat: number,
  long: number,
  radiusKm: number
): Promise<Store[]> => {
  try {
    // Validate coordinates
    if (lat === undefined || long === undefined || radiusKm === undefined) {
      throw new Error('Invalid parameters: lat, long, and radiusKm are required');
    }

    if (typeof lat !== 'number' || typeof long !== 'number' || typeof radiusKm !== 'number') {
      throw new Error('Invalid parameters: lat, long, and radiusKm must be numbers');
    }

    if (!Number.isFinite(lat) || !Number.isFinite(long) || !Number.isFinite(radiusKm)) {
      throw new Error('Invalid parameters: lat, long, and radiusKm must be finite numbers');
    }

    if (radiusKm <= 0) {
      throw new Error(`Invalid radius: radiusKm (${radiusKm}) must be greater than 0`);
    }

    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('long', long.toString());
    params.append('radius', radiusKm.toString());

    logger.debug('STORES_API', 'Fetching nearby stores', { lat, long, radiusKm });
    const response = await apiClient.get(`/stores/nearby?${params.toString()}`);
    
    logger.json('STORES_API', 'Stores response', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('STORES_API', 'Error fetching nearby stores', error, { lat, long, radiusKm });
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw for component error handling
    throw error;
  }
};

