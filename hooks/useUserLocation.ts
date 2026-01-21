import { getUserLocation, UserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import { LocationContext } from '@/contexts/LocationContext';
import { LocationData } from '@/types/location';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';

const CACHED_LOCATION_KEY = 'user_location_cached';

export interface UseUserLocationResult {
  location: LocationData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Default location object for Palermo, Buenos Aires
 */
const DEFAULT_LOCATION_OBJECT: LocationData = {
  lat: DEFAULT_LOCATION.lat,
  long: DEFAULT_LOCATION.long,
  place_id: null,
  display_name: DEFAULT_LOCATION.display_name,
  address_components: {
    neighbourhood: DEFAULT_LOCATION.neighbourhood,
    city: DEFAULT_LOCATION.city,
  },
  location_radius: DEFAULT_LOCATION.radius,
};

/**
 * Converts API UserLocation to LocationData format
 */
const userLocationToLocationData = (userLocation: UserLocation): LocationData => {
  return {
    lat: userLocation.lat,
    long: userLocation.long,
    place_id: userLocation.location.place_id || null,
    display_name: userLocation.location.display_name,
    address_components: {
      neighbourhood: userLocation.location.address.neighbourhood || '',
      city: userLocation.location.address.city || '',
    },
    location_radius: userLocation.location_radius,
  };
};

/**
 * Saves location object to AsyncStorage
 */
const saveCachedLocation = async (location: LocationData): Promise<void> => {
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
const loadCachedLocation = async (): Promise<LocationData | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHED_LOCATION_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as LocationData;
  } catch (error) {
    logger.error('USE_USER_LOCATION', 'Failed to load cached location', error);
    return null;
  }
};

/**
 * Custom hook to get the user's location
 * Checks API first, then falls back to cache, then default
 */
export const useUserLocation = (): UseUserLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const locationContext = useContext(LocationContext);
  const refreshTrigger = locationContext?.refreshTrigger ?? 0;

  /**
   * Gets location from API
   * Returns the location data if successful, null if not found or error
   */
  const getLocationFromAPI = async (): Promise<LocationData | null> => {
    try {
      const userLocation = await getUserLocation();
      if (userLocation) {
        const locationData = userLocationToLocationData(userLocation);
        // Save the location from API to cache
        await saveCachedLocation(locationData);
        return locationData;
      }
      return null;
    } catch (error: any) {
      const status = error.response?.status;
      // 404 means no location is set, which is expected
      // 401 means user is not logged in, which is also expected
      if (status === 404 || status === 401) {
        logger.debug('USE_USER_LOCATION', 'No location in API (expected)', { status });
        return null;
      }
      // For other errors (network, timeout, etc.), log and return null to trigger cache fallback
      logger.warn('USE_USER_LOCATION', 'Location API call failed', error);
      return null;
    }
  };

  /**
   * Loads location with fallback chain: API → cache → default
   */
  const loadLocation = async (): Promise<LocationData> => {
    // Step 1: Try API first
    const apiLocation = await getLocationFromAPI();
    if (apiLocation) {
      return apiLocation;
    }

    // Step 2: API didn't return a location (404, 401, or network error)
    // Fallback to cache
    const cachedLocation = await loadCachedLocation();
    if (cachedLocation) {
      logger.debug('USE_USER_LOCATION', 'Using cached location');
      return cachedLocation;
    }

    // Step 3: No cache available, use default
    logger.debug('USE_USER_LOCATION', 'Using default location (Palermo)');
    await saveCachedLocation(DEFAULT_LOCATION_OBJECT);
    return DEFAULT_LOCATION_OBJECT;
  };

  /**
   * Checks and loads location
   */
  const checkLocation = async () => {
    try {
      setLoading(true);
      const loadedLocation = await loadLocation();
      setLocation(loadedLocation);
    } catch (error) {
      logger.error('USE_USER_LOCATION', 'Error loading location', error);
      // Even on error, set default location to ensure app can proceed
      setLocation(DEFAULT_LOCATION_OBJECT);
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

  return { location, loading, refresh };
};

/**
 * Mark location as set in AsyncStorage by saving the location object
 * Call this after successfully saving a location
 */
export const cacheUserLocation = async (location: LocationData) => {
  await saveCachedLocation(location);
};
