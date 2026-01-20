import { useState, useCallback, useRef } from 'react';
import { getStoresNearby, Store } from '@/api/stores';
import { calculateBoundsFromCenter, isValidCoordinate } from '@/utils/location';
import { logger } from '@/utils/logger';

export function useStoreSearch() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const lastFetchedRef = useRef<{ center: [number, number]; radius: number } | null>(null);

  const fetchStores = useCallback(async (
    center: [number, number],
    radiusKm: number
  ) => {
    if (loadingStores) {
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
      setLoadingStores(true);
      const bounds = calculateBoundsFromCenter(center, radiusKm);
      logger.debug('useStoreSearch', 'Fetching stores for center and radius', { center, radiusKm, bounds });
      const nearbyStores = await getStoresNearby(bounds);
      logger.info('useStoreSearch', `Fetched ${nearbyStores?.length || 0} stores`);

      logger.debug('useStoreSearch', 'Stores received from API', {
        count: nearbyStores?.length || 0,
        stores: nearbyStores?.map(store => ({
          id: store.id,
          name: store.store_name,
          lat: store.latitude,
          long: store.longitude,
          category: store.category,
          hasValidCoords: isValidCoordinate(store.latitude, store.longitude)
        }))
      });

      setStores(nearbyStores);
      lastFetchedRef.current = { center, radius: radiusKm };
    } catch (error) {
      logger.error('useStoreSearch', 'Error fetching stores', error, { center, radiusKm });
    } finally {
      setLoadingStores(false);
    }
  }, [loadingStores]);

  return {
    stores,
    loadingStores,
    fetchStores
  };
}
