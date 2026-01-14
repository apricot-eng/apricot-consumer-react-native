import { getErrorType } from '@/utils/error';
import { logger } from '@/utils/logger';
import { showErrorToast } from '@/utils/toast';
import apiClient from './client';

export interface SurpriseBag {
  id: number;
  store_id: number;
  category: string;
  allergens?: string;
  photo?: string;
  title: string;
  description?: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  star_rating?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: number;
    store_name: string;
    logo?: string;
    neighbourhood?: string;
  };
  // Additional fields that might come from API
  bags_left?: number;
  pickup_time_window?: string;
}

export const getSurpriseBags = async (neighbourhood?: string): Promise<SurpriseBag[]> => {
  try {
    const params = new URLSearchParams();
    
    if (neighbourhood) {
      params.append('neighbourhood', neighbourhood);
    }
    
    const queryString = params.toString();
    const url = `/surprise-bags${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    logger.error('SURPRISE_BAGS_API', 'Error fetching surprise bags', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw with a generic message for component error handling
    throw error;
  }
};

export const getSurpriseBagById = async (id: number): Promise<SurpriseBag> => {
  try {
    const response = await apiClient.get(`/surprise-bags/${id}`);
    return response.data;
  } catch (error: any) {
    logger.error('SURPRISE_BAGS_API', 'Error fetching surprise bag', error);
    const errorType = getErrorType(error);
    showErrorToast(errorType);
    
    // Re-throw for component error handling
    throw error;
  }
};

