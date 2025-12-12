import { LocationSearchResult, saveUserLocation, searchLocations } from '@/api/locations';
import { getStoresNearby, Store } from '@/api/stores';
import { useLocationContext } from '@/contexts/LocationContext';
import { markLocationAsSet, useUserLocation } from '@/hooks/useUserLocation';
import { t } from '@/i18n';
import { calculateBoundsFromCenter, isValidCoordinate } from '@/utils/location';
import { logger } from '@/utils/logger';
import { getMapPinImage } from '@/utils/mapPins';
import { showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';
import Slider from '@react-native-community/slider';
import { Image as ExpoImage } from 'expo-image';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/app/LocationScreen.styles';

// Default center on Palermo, Buenos Aires, Argentina
const DEFAULT_CENTER: [number, number] = [-58.4245236, -34.5803362];
const DEFAULT_ZOOM = 12;

// MapLibre style URL (using a free style)
const MAP_STYLE_URL = 'https://api.maptiler.com/maps/streets-v2/style.json?key=RqClR17cITmceexTV2AF';

export default function LocationScreen() {
  const { refresh } = useUserLocation();
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
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const searchTimeoutRef = useRef<number | null>(null);
  const fetchTimeoutRef = useRef<number | null>(null);
  const lastFetchedRef = useRef<{ center: [number, number]; radius: number } | null>(null);

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
      console.error('Error searching locations:', error);
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
          lon: store.longitude,
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
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (mapCenter && isValidCoordinate(mapCenter[1], mapCenter[0])) {
      fetchTimeoutRef.current = setTimeout(() => {
        fetchStoresForCenter(mapCenter, distance);
      }, 300); // Debounce to avoid rapid successive calls
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [distance, mapCenter, fetchStoresForCenter]);

  // Initial store fetch - only when screen is focused
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        // Use center+radius approach for initial fetch
        if (mapCenter && isValidCoordinate(mapCenter[1], mapCenter[0])) {
          fetchStoresForCenter(mapCenter, distance);
        }
      }, 1000); // Wait for map to initialize

      return () => clearTimeout(timer);
    }, [mapCenter, distance, fetchStoresForCenter])
  );

  // Handle location selection from search
  const handleLocationSelect = (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setSearchQuery(location.display_name);
    setSearchResults([]);
    Keyboard.dismiss();

    // Center map on selected location
    const newCenter: [number, number] = [location.lon, location.lat];
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
        showSuccessToast('Permisos de ubicación denegados');
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
        lon: longitude,
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
      console.error('Error getting current location:', error);
      showSuccessToast('Error al obtener la ubicación');
    }
  };

  // Handle select button
  const handleSelect = async () => {
    if (!selectedLocation) {
      showSuccessToast(t('location.selectLocation'));
      return;
    }

    try {
      setSaving(true);
      await saveUserLocation({
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        place_id: selectedLocation.place_id,
        display_name: selectedLocation.display_name,
        address_components: selectedLocation.address,
      });

      await markLocationAsSet();
      await refresh();
      triggerRefresh(); // Trigger root layout refresh
      showSuccessToast('Ubicación guardada');
      
      // Navigation will be handled by root layout detecting location change
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setSaving(false);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map */}
      <View style={styles.mapContainer}>
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

          {/* Test pin in Palermo to verify map is working */}
          <PointAnnotation
            key="test-pin"
            id="test-pin"
            coordinate={[-58.4245236, -34.5803362]}
          >
            <View style={styles.pinContainer}>
              <ExpoImage
                source={getMapPinImage('cafe')}
                style={styles.pinImage}
                contentFit="contain"
              />
            </View>
          </PointAnnotation>

          {/* Actual Store Pins */}
          {stores
            .filter(store => {
              const isValid = isValidCoordinate(store.latitude, store.longitude);
              if (!isValid) {
                logger.debug('LOCATION_SCREEN', 'Store filtered out - invalid coordinates', {
                  storeId: store.id,
                  storeName: store.store_name,
                  lat: store.latitude,
                  lon: store.longitude
                });
              }
              return isValid;
            })
            .map(store => {
              logger.debug('LOCATION_SCREEN', 'Rendering store pin', {
                storeId: store.id,
                storeName: store.store_name,
                lat: store.latitude,
                lon: store.longitude,
                category: store.category
              });
              const pinImage = getMapPinImage(store.category || 'cafe');
              return (
                <PointAnnotation
                  key={store.id}
                  id={`store-${store.id}`}
                  coordinate={[store.longitude!, store.latitude!]}
                >
                  <View style={styles.pinContainer}>
                    <ExpoImage
                      source={pinImage}
                      style={styles.pinImage}
                      contentFit="contain"
                    />
                  </View>
                </PointAnnotation>
              );
            })}
        </MapView>

        {loadingStores && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#794509" />
            <Text style={styles.loadingText}>{t('location.loadingStores')}</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView
          style={styles.bottomSheetContent}
          contentContainerStyle={styles.bottomSheetScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Distance Slider */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>{t('location.distanceLabel')}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={50}
              value={distance}
              onValueChange={setDistance}
              minimumTrackTintColor="#794509"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#794509"
            />
            <Text style={styles.distanceValue}>{Math.round(distance)} km</Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('location.searchPlaceholder')}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearching && (
              <ActivityIndicator size="small" color="#666" style={styles.searchLoader} />
            )}

            {/* Predictive Search Overlay */}
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => handleLocationSelect(result)}
                  >
                    <Ionicons name="location" size={16} color="#794509" />
                    <Text style={styles.searchResultText} numberOfLines={1}>
                      {result.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <View style={styles.searchResults}>
                <Text style={styles.noResultsText}>{t('location.noResults')}</Text>
              </View>
            )}
          </View>

          {/* Use Current Location */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="compass" size={20} color="#794509" />
            <Text style={styles.currentLocationText}>
              {t('location.useCurrentLocation')}
            </Text>
          </TouchableOpacity>

          {/* Select Button */}
          <TouchableOpacity
            style={[styles.selectButton, saving && styles.selectButtonDisabled]}
            onPress={handleSelect}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.selectButtonText}>{t('location.select')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
