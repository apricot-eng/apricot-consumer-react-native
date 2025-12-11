import { API_CONFIG } from '@/config/api';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = API_CONFIG.BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request
    logger.api.request(
      config.method?.toUpperCase() || 'GET',
      `${config.baseURL}${config.url}`,
      config,
      config.data
    );
  } catch (error) {
    logger.error('API_CLIENT', 'Error getting auth token', error);
  }
  return config;
});

// Log responses
apiClient.interceptors.response.use(
  (response) => {
    logger.api.response(
      response.config.method?.toUpperCase() || 'GET',
      `${response.config.baseURL}${response.config.url}`,
      response,
      response.data
    );
    return response;
  },
  (error) => {
    logger.api.error(
      error.config?.method?.toUpperCase() || 'GET',
      `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      error
    );
    return Promise.reject(error);
  }
);

export default apiClient;

