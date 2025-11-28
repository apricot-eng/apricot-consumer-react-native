import { getErrorType, showErrorToast } from '@/utils/toast';
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
  created_at?: string;
  updated_at?: string;
}

export const getStoreById = async (id: number): Promise<Store> => {
  try {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching store:', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw for component error handling
    throw error;
  }
};

