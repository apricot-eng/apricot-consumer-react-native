import { getUserLocation, saveUserLocation, UserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import { LocationContext } from '@/contexts/LocationContext';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';

const CACHED_LOCATION_KEY = 'user_location_cached';

/**
 * Cached location object structure
 * Matches the format stored in AsyncStorage
 */
export interface CachedLocation {
  lat: number;
  long: number;
  place_id: string | null;
  display_name: string;
  address_components: {
    neighbourhood: string;
    city: string;
  };
}

export interface UseUserLocationResult {
  hasLocation: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Default location object for Palermo, Buenos Aires
 */
const DEFAULT_LOCATION_OBJECT: CachedLocation = {
  lat: DEFAULT_LOCATION.lat,
  long: DEFAULT_LOCATION.lon,
  place_id: null,
  display_name: DEFAULT_LOCATION.display_name,
  address_components: {
    neighbourhood: DEFAULT_LOCATION.neighbourhood,
    city: DEFAULT_LOCATION.city,
  },
};

/**
 * Converts API UserLocation to CachedLocation format
 */
const userLocationToCached = (userLocation: UserLocation): CachedLocation => {
  return {
    lat: userLocation.lat,
    long: userLocation.lon,
    place_id: userLocation.location.place_id || null,
    display_name: userLocation.location.display_name,
    address_components: {
      neighbourhood: userLocation.location.address.neighbourhood || '',
      city: userLocation.location.address.city || '',
    },
  };
};

/**
 * Saves location object to AsyncStorage
 */
const saveCachedLocation = async (location: CachedLocation): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHED_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    logger.error('USE_USER_LOCATION', 'Failed to save cached location', error);
    throw error;
  }
};

/**
 * Loads location object from AsyncStorage
 */
const loadCachedLocation = async (): Promise<CachedLocation | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_LOCATION_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as CachedLocation;
  } catch (error) {
    logger.error('USE_USER_LOCATION', 'Failed to load cached location', error);
    return null;
  }
};

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
  const setLocationState = async (location: CachedLocation) => {
    setHasLocation(true);
    await saveCachedLocation(location);
  };

  /**
   * Verifies location with API and updates cached location accordingly
   */
  const verifyLocationWithAPI = async (): Promise<CachedLocation | null> => {
    try {
      const userLocation = await getUserLocation();
      if (userLocation) {
        const cachedLocation = userLocationToCached(userLocation);
        // Save the location from API to cache
        await saveCachedLocation(cachedLocation);
        return cachedLocation;
      }
      return null;
    } catch (error: any) {
      logger.warn('USE_USER_LOCATION', 'Location API verification failed', error);
      return null;
    }
  };

  /**
   * Handles the case when we have a cached location value
   */
  const handleCachedLocation = async (cachedLocation: CachedLocation) => {
    const apiLocation = await verifyLocationWithAPI();
    if (apiLocation !== null) {
      // API call succeeded - use API location (it's the source of truth)
      await setLocationState(apiLocation);
    } else {
      // API call failed, trust the cache (handles offline scenarios)
      setHasLocation(true);
    }
  };

  /**
   * Handles the case when we don't have a cached location value
   */
  const handleNoCachedLocation = async () => {
    const apiLocation = await verifyLocationWithAPI();
    if (apiLocation === null) {
      // API call failed, set default location
      await setDefaultLocation();
    } else if (apiLocation) {
      // Location exists in API
      await setLocationState(apiLocation);
    } else {
      // No location exists in API, set default
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
      const cachedLocation = await loadCachedLocation();
      if (cachedLocation) {
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
      
      const cachedLocation = await loadCachedLocation();
      if (cachedLocation) {
        await handleCachedLocation(cachedLocation);
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
      // Save default location to cache first
      await saveCachedLocation(DEFAULT_LOCATION_OBJECT);
      setHasLocation(true);
      
      // Try to save default location to API
      try {
        await saveUserLocation({
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
          place_id: DEFAULT_LOCATION.place_id || undefined,
          display_name: DEFAULT_LOCATION.display_name,
          address_components: {
            neighbourhood: DEFAULT_LOCATION.neighbourhood,
            city: DEFAULT_LOCATION.city,
          },
        });
        // Successfully saved to API - update cache with API response
        const apiLocation = await verifyLocationWithAPI();
        if (apiLocation) {
          await saveCachedLocation(apiLocation);
        }
      } catch (saveError: any) {
        // If save fails (network error, etc.), we still have the cached default
        logger.warn('USE_USER_LOCATION', 'Failed to save default location to API, using cached default', saveError);
      }
    } catch (error) {
      // Fallback: even if everything fails, allow app to proceed with default
      logger.error('USE_USER_LOCATION', 'Error setting default location', error);
      setHasLocation(true);
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
 * Mark location as set in AsyncStorage by saving the location object
 * Call this after successfully saving a location
 */
export const markLocationAsSet = async (location: CachedLocation) => {
  await saveCachedLocation(location);
};
