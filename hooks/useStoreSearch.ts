import { useState, useCallback, useRef } from 'react';
import { getStoresNearby, Store } from '@/api/stores';
import { isValidCoordinate } from '@/utils/location';
import { logger } from '@/utils/logger';

export function useStoreSearch() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadingStoresRef = useRef(false);
  const lastFetchedRef = useRef<{ center: [number, number]; radius: number } | null>(null);

  const fetchStores = useCallback(async (
    center: [number, number],
    radiusKm: number
  ) => {
    if (loadingStoresRef.current) {
      logger.debug('useStoreSearch', 'Skipping fetch - already loading');
      return;
    }

    if (!isValidCoordinate(center[1], center[0])) {
      logger.warn('useStoreSearch', 'Skipping fetch - invalid coordinates');
      return;
    }

    const lastFetched = lastFetchedRef.current;
    if (lastFetched &&
        Math.abs(lastFetched.center[0] - center[0]) < 0.0001 &&
        Math.abs(lastFetched.center[1] - center[1]) < 0.0001 &&
        lastFetched.radius === radiusKm) {
      logger.debug('useStoreSearch', 'Skipping fetch - same center and radius');
      return;
    }

    try {
      loadingStoresRef.current = true;
      setLoadingStores(true);
      setError(null);
      
      // Extract lat and long from center [longitude, latitude]
      const lat = center[1];
      const long = center[0];
      
      logger.debug('useStoreSearch', 'Fetching stores for center and radius', { center, lat, long, radiusKm });
      const nearbyStores = await getStoresNearby(lat, long, radiusKm);
      logger.info('useStoreSearch', `Fetched ${nearbyStores?.length || 0} stores`);

      setStores(nearbyStores);
      lastFetchedRef.current = { center, radius: radiusKm };
    } catch (error: any) {
      logger.error('useStoreSearch', 'Error fetching stores', error, { center, radiusKm });
      setError(error);
    } finally {
      loadingStoresRef.current = false;
      setLoadingStores(false);
    }
  }, []);

  return {
    stores,
    loadingStores,
    error,
    fetchStores
  };
}
