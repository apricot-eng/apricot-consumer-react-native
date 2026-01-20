import { LocationSearchResult, saveUserLocationApi, searchLocations } from '@/api/locations';
import { getStoresNearby, Store } from '@/api/stores';
import LocationActionSheet from '@/components/LocationActionSheet';
import { useLocationContext } from '@/contexts/LocationContext';
import { cacheUserLocation, useUserLocation } from '@/hooks/useUserLocation';
import { t } from '@/i18n';
import { ErrorType } from '@/utils/error';
import { calculateBoundsFromCenter, distanceToZoomLevel, isValidCoordinate, locationSearchResultToLocationData, validateAndConvertCoordinates } from '@/utils/location';
import { logger } from '@/utils/logger';
import { getMapPinImage } from '@/utils/mapPins';
import { showErrorToast } from '@/utils/toast';
import {
  Camera,
  Images,
  MapView,
  ShapeSource,
  SymbolLayer
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/app/LocationScreen.styles';

// Default center on Palermo, Buenos Aires, Argentina
const DEFAULT_CENTER: [number, number] = [-58.4245236, -34.5803362];
const DEFAULT_ZOOM = 12;

// MapLibre style URL (using a free style)
const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_API_KEY}`;

export default function LocationScreen() {
  const router = useRouter();
  const { location, loading: loadingLocation, refresh } = useUserLocation();
  const { triggerRefresh } = useLocationContext();
  const mapRef = useRef<React.ComponentRef<typeof MapView>>(null);
  const cameraRef = useRef<React.ComponentRef<typeof Camera>>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  const [distance, setDistance] = useState(2); // Default 2km
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [saving, setSaving] = useState(false);
  // Initialize mapCenter from location when available, fallback to DEFAULT_CENTER
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    // This will be updated via useEffect when location loads
    return DEFAULT_CENTER;
  });
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const searchTimeoutRef = useRef<number | null>(null);
  const fetchTimeoutRef = useRef<number | null>(null);
  const lastFetchedRef = useRef<{ center: [number, number]; radius: number } | null>(null);

  // Initialize map center from location when it loads
  useEffect(() => {
    if (!loadingLocation && location) {
      const center: [number, number] = [location.long, location.lat];
      if (isValidCoordinate(location.lat, location.long)) {
        setMapCenter(center);
        // Center camera on loaded location
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: center,
            zoomLevel: DEFAULT_ZOOM,
            animationDuration: 0, // No animation on initial load
          });
        }
      } else {
        logger.warn('LOCATION_SCREEN', 'Invalid location coordinates from hook', location);
      }
    }
  }, [loadingLocation, location]);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocations(query, 3); // Max 3 results
      setSearchResults(results);
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Error searching locations', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Fetch stores using center point and radius
  // Converts center+radius to bounding box for the API
  const fetchStoresForCenter = useCallback(async (
    center: [number, number],
    radiusKm: number
  ) => {
    // Prevent concurrent requests
    if (loadingStores) {
      logger.debug('LOCATION_SCREEN', 'Skipping fetch - already loading');
      return;
    }

    // Check if we already fetched for this exact center and radius
    const lastFetched = lastFetchedRef.current;
    if (lastFetched && 
        Math.abs(lastFetched.center[0] - center[0]) < 0.0001 && 
        Math.abs(lastFetched.center[1] - center[1]) < 0.0001 &&
        lastFetched.radius === radiusKm) {
      logger.debug('LOCATION_SCREEN', 'Skipping fetch - same center and radius');
      return;
    }

    try {
      setLoadingStores(true);
      const bounds = calculateBoundsFromCenter(center, radiusKm);
      logger.debug('LOCATION_SCREEN', 'Fetching stores for center and radius', { center, radiusKm, bounds });
      const nearbyStores = await getStoresNearby(bounds);
      logger.info('LOCATION_SCREEN', `Fetched ${nearbyStores?.length || 0} stores`);
      
      // Log store details for debugging
      logger.debug('LOCATION_SCREEN', 'Stores received from API', {
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
      
      // Store last fetched values
      lastFetchedRef.current = { center, radius: radiusKm };
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Error fetching stores', error, { center, radiusKm });
    } finally {
      setLoadingStores(false);
    }
  }, [loadingStores]);

  // Handle map region change - update center only (useEffect will handle fetch)
  // Uses center+radius approach instead of bounds
  const handleRegionDidChange = useCallback(async () => {
    if (!mapRef.current || loadingStores) return;

    try {
      const bounds = await mapRef.current.getVisibleBounds();
      if (bounds && bounds.length >= 2 && bounds[0] && bounds[1]) {
        // MapLibre returns bounds as [longitude, latitude] pairs
        // bounds[0] = southwest corner [west_lon, south_lat]
        // bounds[1] = northeast corner [east_lon, north_lat]
        const swLon = Number(bounds[0][0]);
        const swLat = Number(bounds[0][1]);
        const neLon = Number(bounds[1][0]);
        const neLat = Number(bounds[1][1]);
        
        // Calculate center from bounds
        const centerLon = (neLon + swLon) / 2;
        const centerLat = (neLat + swLat) / 2;
        
        // Validate center coordinates
        if (isValidCoordinate(centerLat, centerLon)) {
          const newCenter: [number, number] = [centerLon, centerLat];
          
          // Only update if center changed significantly (avoid micro-movements)
          const currentCenter = mapCenter;
          const latDiff = Math.abs(newCenter[1] - currentCenter[1]);
          const lonDiff = Math.abs(newCenter[0] - currentCenter[0]);
          const threshold = 0.001; // ~100 meters
          
          if (latDiff > threshold || lonDiff > threshold) {
            setMapCenter(newCenter);
          }
        } else {
          logger.warn('LOCATION_SCREEN', 'Invalid center coordinates calculated from bounds', { bounds, centerLon, centerLat });
        }
      } else {
        logger.warn('LOCATION_SCREEN', 'Invalid bounds array from map', { bounds });
      }
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Error getting map bounds', error);
    }
  }, [loadingStores, mapCenter]);

  // Refetch stores when distance slider or map center changes (debounced)
  // Commented out useEffect that seems overkill, until we understand why we need it better.
  // useEffect(() => {
  //   if (fetchTimeoutRef.current) {
  //     clearTimeout(fetchTimeoutRef.current);
  //   }

  //   if (mapCenter && isValidCoordinate(mapCenter[1], mapCenter[0])) {
  //     fetchTimeoutRef.current = setTimeout(() => {
  //       fetchStoresForCenter(mapCenter, distance);
  //     }, 300); // Debounce to avoid rapid successive calls
  //   }

  //   return () => {
  //     if (fetchTimeoutRef.current) {
  //       clearTimeout(fetchTimeoutRef.current);
  //     }
  //   };
  // }, [distance, mapCenter, fetchStoresForCenter]);

  // Initial store fetch - only when screen is focused
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        // Use center+radius approach for initial fetch
        if (mapCenter && isValidCoordinate(mapCenter[1], mapCenter[0])) {
          fetchStoresForCenter(mapCenter, distance);
        }
        logger.debug('LOCATION_SCREEN', 'useFocusEffect called');
      }, 400); // Wait for map to initialize

      return () => clearTimeout(timer);
    }, [mapCenter, distance, fetchStoresForCenter])
  );

  // Handle location selection from search
  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.display_name ?? '');
    setSearchResults([]);
    Keyboard.dismiss();

    // Convert and validate coordinates
    const newCenter = validateAndConvertCoordinates(location);
    if (!newCenter) {
      return;
    }

    // Center map on selected location
    setMapCenter(newCenter);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: newCenter,
        zoomLevel: 15,
        animationDuration: 1000,
        animationMode: 'easeTo',
      });
    }
    // Fetch stores for new center with current distance (useEffect will also trigger, but this is intentional for immediate feedback)
    fetchStoresForCenter(newCenter, distance);
  };

  // Handle current location button
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('LOCATION_SCREEN', 'Location permissions denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const newCenter: [number, number] = [longitude, latitude];
      setMapCenter(newCenter);
      setSelectedLocation({
        id: 'current',
        display_name: 'Mi ubicación actual',
        lat: latitude,
        long: longitude,
        place_id: '',
        address: {},
      });

      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newCenter,
          zoomLevel: 15,
          animationDuration: 1000,
          animationMode: 'easeTo',
        });
      }
      // Fetch stores for new center with current distance (useEffect will also trigger, but this is intentional for immediate feedback)
      fetchStoresForCenter(newCenter, distance);
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Error getting current location', error);
    }
  };

  // Handle select button
  const handleSelect = async () => {
    /* TODO: Here we need to save whatever bounds are set on the map.
     * So selectedLocation must have a value of some sort, because we're displaying
     * something on the map already.
     */
    if (!selectedLocation) {
      logger.warn('LOCATION_SCREEN', 'No location selected');
      return;
    }

    setSaving(true);
    const locationData = locationSearchResultToLocationData(selectedLocation);
    
    // Try to save via API - track if it succeeds or fails silently (401 for guest users)
    let apiSaveSucceeded = false;
    let apiSaveFailedWithNonGuestError = false;
    try {
      await saveUserLocationApi(locationData);
      apiSaveSucceeded = true;
    } catch (error: any) {
      const code = error.response?.status;
      // 401 means user is a guest (not authenticated) - fail silently, this is OK
      if (code === 401) {
        logger.warn('LOCATION_SCREEN', 'Failed to save location to API (guest user)', error);
        apiSaveSucceeded = false; // Not a success, but acceptable
        apiSaveFailedWithNonGuestError = false; // This is OK, don't block dismissal
      } else {
        // Other errors (network, server errors, etc.) - this should prevent dismissal
        logger.error('LOCATION_SCREEN', 'Failed to save location to API (non-guest error)', error);
        apiSaveFailedWithNonGuestError = true;
      }
    }
    
    // Cache location locally - this must succeed
    let cacheSaveSucceeded = false;
    try {
      await cacheUserLocation(locationData);
      cacheSaveSucceeded = true;
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Failed to cache location locally', error);
      showErrorToast(ErrorType.SAVE_LOCATION);
      setSaving(false);
      return; // Don't proceed if caching fails
    }
    
    // Only dismiss if:
    // 1. Cache save succeeded AND
    // 2. (API save succeeded OR API failed silently for guest users)
    // If API failed with a non-guest error, don't dismiss
    if (!cacheSaveSucceeded || apiSaveFailedWithNonGuestError) {
      setSaving(false);
      return;
    }
    
    // Refresh location context and trigger root layout refresh
    await refresh();
    triggerRefresh(); // Trigger root layout refresh
    
    setSaving(false);
    // Dismiss the modal after successfully saving
    router.dismiss();
  };

  // Handle distance slider completion (when user releases slider)
  const handleDistanceSliderComplete = useCallback((value: number) => {
    const newZoom = distanceToZoomLevel(value);
    setMapZoom(newZoom);
    
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: mapCenter,
        zoomLevel: newZoom,
        animationDuration: 500,
        animationMode: 'easeTo',
      });
    }
    
    // Refetch stores with new distance radius
    if (mapCenter && isValidCoordinate(mapCenter[1], mapCenter[0])) {
      fetchStoresForCenter(mapCenter, value);
    }
  }, [mapCenter, fetchStoresForCenter]);

  // Get map pin component for rendering in PointAnnotation
  const getMapPinComponent = useCallback((
    id: string,
    coordinate: [number, number],
    pinImage: any,
    name: string
  ) => {
    return (
      <React.Fragment key={id}>
      <Images images={pinImage} />

      <ShapeSource
        id={`${id}-shape`}
        shape={{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: id,
              geometry: {
                type: 'Point',
                coordinates: coordinate,
              },
              properties: {},
            } as GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>,
          ],
        }}
      >
        <SymbolLayer
          id={`${id}-symbols`}
          style={{
            iconImage: pinImage,
            iconSize: 0.3,
            iconAllowOverlap: true,
          }}
        />
      </ShapeSource>
      </React.Fragment>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map */}
      <View style={styles.mapContainer}>
        {loadingLocation ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#794509" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              mapStyle={MAP_STYLE_URL}
              onRegionDidChange={handleRegionDidChange}
            >
              <Camera
                ref={cameraRef}
                defaultSettings={{
                  centerCoordinate: mapCenter,
                  zoomLevel: mapZoom,
                }}
              />

              {/* Actual Store Pins */}
              {stores
                .filter(store => {
                  const isValid = isValidCoordinate(store.latitude, store.longitude);
                  if (!isValid) {
                    logger.debug('LOCATION_SCREEN', 'Store filtered out - invalid coordinates', {
                      storeId: store.id,
                      storeName: store.store_name,
                      lat: store.latitude,
                      long: store.longitude
                    });
                  }
                  return isValid;
                })
                .map(store => {
                  logger.debug('LOCATION_SCREEN', 'Rendering store pin', {
                    storeId: store.id,
                    storeName: store.store_name,
                    lat: store.latitude,
                    long: store.longitude,
                    category: store.category
                  });
                  const pinImage = getMapPinImage(store.category || 'cafe');
                  return getMapPinComponent(
                    `store-${store.id}`,
                    [store.longitude!, store.latitude!],
                    pinImage,
                    store.category || 'restaurante',
                  );
                })}
            </MapView>

            {loadingStores && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#794509" />
                <Text style={styles.loadingText}>{t('location.loadingStores')}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Bottom Sheet */}
      <LocationActionSheet
        distance={distance}
        onDistanceChange={setDistance}
        onDistanceSliderComplete={handleDistanceSliderComplete}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        onLocationSelect={handleLocationSelect}
        onUseCurrentLocation={handleUseCurrentLocation}
        onSelect={handleSelect}
        saving={saving}
      />
    </SafeAreaView>
  );
}
