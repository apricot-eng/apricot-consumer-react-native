import { getUserLocation } from '@/api/locations';
import { LocationContext } from '@/contexts/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';

const LOCATION_SET_KEY = 'user_location_set';

export interface UseUserLocationResult {
  hasLocation: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to check if the user has a location set
 * Checks AsyncStorage first, then verifies with API if needed
 */
export const useUserLocation = (): UseUserLocationResult => {
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const locationContext = useContext(LocationContext);
  const refreshTrigger = locationContext?.refreshTrigger ?? 0;

  const checkLocation = async () => {
    try {
      setLoading(true);
      
      // First check AsyncStorage for cached value
      const cachedValue = await AsyncStorage.getItem(LOCATION_SET_KEY);
      if (cachedValue === 'true') {
        // Verify with API
        try {
          const location = await getUserLocation();
          if (location) {
            setHasLocation(true);
            await AsyncStorage.setItem(LOCATION_SET_KEY, 'true');
          } else {
            setHasLocation(false);
            await AsyncStorage.setItem(LOCATION_SET_KEY, 'false');
          }
        } catch (error: any) {
          // If API check fails but we have cached value, trust the cache
          // This handles offline scenarios
          console.warn('Location API verification failed, using cache:', error.message);
          setHasLocation(cachedValue === 'true');
        }
      } else {
        // No cached value, check API with timeout handling
        try {
          const location = await getUserLocation();
          const locationSet = location !== null;
          setHasLocation(locationSet);
          await AsyncStorage.setItem(LOCATION_SET_KEY, locationSet ? 'true' : 'false');
        } catch (apiError: any) {
          // If API fails (network error, timeout, etc.), assume no location
          // This prevents the app from hanging on startup
          console.warn('Location API check failed, assuming no location:', apiError.message);
          setHasLocation(false);
          await AsyncStorage.setItem(LOCATION_SET_KEY, 'false');
        }
      }
    } catch (error: any) {
      // If it's a 404, user has no location
      if (error.response?.status === 404) {
        setHasLocation(false);
        await AsyncStorage.setItem(LOCATION_SET_KEY, 'false');
      } else {
        // For other errors, check cache
        const cachedValue = await AsyncStorage.getItem(LOCATION_SET_KEY);
        setHasLocation(cachedValue === 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLocation();
  }, [refreshTrigger]);

  const refresh = async () => {
    await checkLocation();
  };

  return { hasLocation, loading, refresh };
};

/**
 * Mark location as set in AsyncStorage
 * Call this after successfully saving a location
 */
export const markLocationAsSet = async () => {
  await AsyncStorage.setItem(LOCATION_SET_KEY, 'true');
};
