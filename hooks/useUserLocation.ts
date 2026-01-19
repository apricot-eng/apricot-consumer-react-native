import { getUserLocation, saveUserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import { LocationContext } from '@/contexts/LocationContext';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';

const LOCATION_SET_KEY = 'user_location_set';
const DEFAULT_LOCATION_SET_KEY = 'default_location_set';

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

  /**
   * Sets the location state and persists it to AsyncStorage
   */
  const setLocationState = async (value: boolean) => {
    setHasLocation(value);
    await AsyncStorage.setItem(LOCATION_SET_KEY, value ? 'true' : 'false');
  };

  /**
   * Verifies location with API and updates state accordingly
   */
  const verifyLocationWithAPI = async (): Promise<boolean | null> => {
    try {
      const location = await getUserLocation();
      return location !== null;
    } catch (error: any) {
      logger.warn('USE_USER_LOCATION', 'Location API verification failed', error);
      return null;
    }
  };

  /**
   * Handles the case when we have a cached location value
   */
  const handleCachedLocation = async (cachedValue: string) => {
    const locationExists = await verifyLocationWithAPI();
    if (locationExists !== null) {
      // API call succeeded
      await setLocationState(locationExists);
    } else {
      // API call failed, trust the cache (handles offline scenarios)
      setHasLocation(cachedValue === 'true');
    }
  };

  /**
   * Handles the case when we don't have a cached location value
   */
  const handleNoCachedLocation = async () => {
    const locationExists = await verifyLocationWithAPI();
    if (locationExists === null) {
      // API call failed, check if default was set before
      const defaultSet = await AsyncStorage.getItem(DEFAULT_LOCATION_SET_KEY);
      if (defaultSet === 'true') {
        await setLocationState(true);
      } else {
        await setDefaultLocation();
      }
    } else if (locationExists) {
      // Location exists in API
      await setLocationState(true);
    } else {
      // No location exists, set default
      await setDefaultLocation();
    }
  };

  /**
   * Handles errors during location check
   */
  const handleLocationError = async (error: any) => {
    if (error.response?.status === 404) {
      // User has no location - set default
      await setDefaultLocation();
    } else {
      // For other errors, check cache
      const cachedValue = await AsyncStorage.getItem(LOCATION_SET_KEY);
      const defaultSet = await AsyncStorage.getItem(DEFAULT_LOCATION_SET_KEY);
      if (cachedValue === 'true' || defaultSet === 'true') {
        setHasLocation(true);
      } else {
        // No cache and error occurred, set default
        await setDefaultLocation();
      }
    }
  };

  const checkLocation = async () => {
    try {
      setLoading(true);
      
      const cachedValue = await AsyncStorage.getItem(LOCATION_SET_KEY);
      if (cachedValue === 'true') {
        await handleCachedLocation(cachedValue);
      } else {
        await handleNoCachedLocation();
      }
    } catch (error: any) {
      await handleLocationError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set default location (Palermo) when user has no location
   */
  const setDefaultLocation = async () => {
    try {
      // Try to save default location to API
      try {
        await saveUserLocation({
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
          place_id: DEFAULT_LOCATION.place_id,
          display_name: DEFAULT_LOCATION.display_name,
          address_components: {
            neighbourhood: DEFAULT_LOCATION.neighbourhood,
            city: DEFAULT_LOCATION.city,
            state: DEFAULT_LOCATION.state,
            country: DEFAULT_LOCATION.country,
          },
        });
        // Successfully saved to API
        setHasLocation(true);
        await AsyncStorage.setItem(LOCATION_SET_KEY, 'true');
        await AsyncStorage.setItem(DEFAULT_LOCATION_SET_KEY, 'true');
      } catch (saveError: any) {
        // If save fails (network error, etc.), still mark as having location
        // so app can proceed with default
        logger.warn('USE_USER_LOCATION', 'Failed to save default location to API, using local default', saveError);
        setHasLocation(true);
        await AsyncStorage.setItem(LOCATION_SET_KEY, 'true');
        await AsyncStorage.setItem(DEFAULT_LOCATION_SET_KEY, 'true');
      }
    } catch (error) {
      // Fallback: even if everything fails, allow app to proceed
      logger.error('USE_USER_LOCATION', 'Error setting default location', error);
      setHasLocation(true);
      await AsyncStorage.setItem(LOCATION_SET_KEY, 'true');
      await AsyncStorage.setItem(DEFAULT_LOCATION_SET_KEY, 'true');
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
