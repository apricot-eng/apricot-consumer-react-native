import { logger } from '@/utils/logger';
import { getErrorType } from '@/utils/error';
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
  lon: number;
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
 * Get stores within map bounds
 * @param bounds - Map bounding box coordinates
 * @param userLocation - Optional user location for distance calculation
 * @returns Array of stores within the bounds
 */
export const getStoresNearby = async (
  bounds: MapBounds,
  userLocation?: UserLocationCoords
): Promise<Store[]> => {
  try {
    // Validate bounds before using them
    if (
      bounds.north === undefined ||
      bounds.south === undefined ||
      bounds.east === undefined ||
      bounds.west === undefined
    ) {
      throw new Error('Invalid map bounds: missing required coordinates');
    }

    // Ensure north > south and east > west
    if (bounds.north <= bounds.south) {
      throw new Error(`Invalid map bounds: north (${bounds.north}) must be greater than south (${bounds.south})`);
    }
    if (bounds.east <= bounds.west) {
      throw new Error(`Invalid map bounds: east (${bounds.east}) must be greater than west (${bounds.west})`);
    }

    const params = new URLSearchParams();
    params.append('north', bounds.north.toString());
    params.append('south', bounds.south.toString());
    params.append('east', bounds.east.toString());
    params.append('west', bounds.west.toString());
    
    if (userLocation) {
      if (userLocation.lat === undefined || userLocation.lon === undefined) {
        logger.warn('STORES_API', 'Invalid user location coordinates', userLocation);
      } else {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lon.toString());
      }
    }

    logger.debug('STORES_API', 'Fetching nearby stores', { bounds, userLocation });
    const response = await apiClient.get(`/stores/nearby?${params.toString()}`);
    
    logger.json('STORES_API', 'Stores response', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('STORES_API', 'Error fetching nearby stores', error, { bounds, userLocation });
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw for component error handling
    throw error;
  }
};

