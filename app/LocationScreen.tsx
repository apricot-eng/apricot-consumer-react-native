import { LocationSearchResult, saveUserLocationApi } from '@/api/locations';
import LocationActionSheet from '@/components/LocationActionSheet';
import { MapPin } from '@/components/MapPin';
import { useLocationContext } from '@/contexts/LocationContext';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import { useMapControl } from '@/hooks/useMapControl';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { cacheUserLocation, useUserLocation } from '@/hooks/useUserLocation';
import { t } from '@/i18n';
import { styles } from '@/styles/app/LocationScreen.styles';
import { ErrorType } from '@/utils/error';
import { distanceToZoomLevel, isValidCoordinate, locationSearchResultToLocationData, validateAndConvertCoordinates } from '@/utils/location';
import { logger } from '@/utils/logger';
import { getMapPinImage } from '@/utils/mapPins';
import { showErrorToast } from '@/utils/toast';
import {
  Camera,
  MapView,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_API_KEY}`;

export default function LocationScreen() {
  const router = useRouter();
  const { location, loading: loadingLocation, refresh } = useUserLocation();
  const { triggerRefresh } = useLocationContext();

  const {
    selectedLocation,
    setSelectedLocation,
    distance,
    setDistance,
    saving,
    setSaving,
  } = useLocationSelection(location);

  // Custom Hooks
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
    setSearchQueryWithoutSearch,
  } = useLocationSearch();

  const {
    mapRef,
    cameraRef,
    mapCenter,
    mapZoom,
    setMapZoom,
    centerOnCoordinates,
    handleRegionDidChange,
  } = useMapControl(location);

  const { stores, loadingStores, fetchStores, error: storesError } = useStoreSearch();

  // Handle store fetch error
  useEffect(() => {
    if (storesError) {
      Toast.show({
        type: 'errorRetry',
        text1: t('common.error'),
        text2: t('location.errorFetchingStores'),
        position: 'top',
        visibilityTime: 6000,
        props: {
          onRetry: () => fetchStores(mapCenter, distance),
        },
      });
    }
  }, [storesError, mapCenter, distance, fetchStores]);

  // Initial store fetch
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        fetchStores(mapCenter, distance);
      }, 400); // Wait for map to initialize
      return () => clearTimeout(timer);
    }, [mapCenter, distance, fetchStores])
  );
    
  // Handle location selection from search
  const handleLocationSelect = (locationResult: LocationSearchResult) => {
    setSelectedLocation(locationResult);
    setSearchQueryWithoutSearch(locationResult.display_name ?? '');
    Keyboard.dismiss();

    const newCenter = validateAndConvertCoordinates(locationResult);
    if (newCenter) {
      centerOnCoordinates(newCenter, 15);
      fetchStores(newCenter, distance);
    }
  };

  // Handle current location button
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('LOCATION_SCREEN', 'Location permissions denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      const newCenter: [number, number] = [longitude, latitude];
      const currentLocSearchResult: LocationSearchResult = {
        id: 'current',
        display_name: 'Mi ubicación actual',
        lat: latitude,
        long: longitude,
        place_id: '',
        address: {},
      };

      setSelectedLocation(currentLocSearchResult);
      setSearchQueryWithoutSearch(currentLocSearchResult.display_name);
      centerOnCoordinates(newCenter, 15);
      fetchStores(newCenter, distance);
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Error getting current location', error);
    }
  };

  // Handle select button
  const handleSelect = async () => {
    if (!selectedLocation) {
      logger.warn('LOCATION_SCREEN', 'No location selected');
      return;
    }

    setSaving(true);
    const locationData = locationSearchResultToLocationData(selectedLocation, distance);
    
    let apiSaveSucceeded = false;
    let apiSaveFailedWithNonGuestError = false;
    try {
      await saveUserLocationApi(locationData);
      apiSaveSucceeded = true;
    } catch (error: any) {
      const code = error.response?.status;
      if (code === 401) {
        logger.warn('LOCATION_SCREEN', 'Failed to save location to API (guest user)', error);
      } else {
        logger.error('LOCATION_SCREEN', 'Failed to save location to API (non-guest error)', error);
        apiSaveFailedWithNonGuestError = true;
      }
    }
    
    let cacheSaveSucceeded = false;
    try {
      await cacheUserLocation(locationData);
      cacheSaveSucceeded = true;
    } catch (error) {
      logger.error('LOCATION_SCREEN', 'Failed to cache location locally', error);
      showErrorToast(ErrorType.SAVE_LOCATION);
      setSaving(false);
      return;
    }
    
    if (!cacheSaveSucceeded || apiSaveFailedWithNonGuestError) {
      setSaving(false);
      return;
    }
    
    await refresh();
    triggerRefresh();
    
    setSaving(false);
    router.back();
  };

  // Handle distance slider completion
  const handleDistanceSliderComplete = useCallback((value: number) => {
    const newZoom = distanceToZoomLevel(value);
    setMapZoom(newZoom);
    centerOnCoordinates(mapCenter, newZoom);
    fetchStores(mapCenter, value);
  }, [mapCenter, fetchStores, centerOnCoordinates, setMapZoom]);

  const onRegionChanged = useCallback((newCenter: [number, number]) => {
      fetchStores(newCenter, distance);
  }, [distance, fetchStores]);

  const onMapRegionDidChange = useCallback(() => {
    handleRegionDidChange(onRegionChanged);
  }, [handleRegionDidChange, onRegionChanged]);



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
              onRegionDidChange={onMapRegionDidChange}
            >
              <Camera
                ref={cameraRef}
                defaultSettings={{
                  centerCoordinate: mapCenter,
                  zoomLevel: mapZoom,
                }}
              />
              {stores
                .filter(store => isValidCoordinate(store.latitude, store.longitude))
                .map(store => {
                  const pinImage = getMapPinImage(store.category || 'cafe');
                  return (
                    <MapPin
                      key={`store-${store.id}`}
                      id={`store-${store.id}`}
                      coordinate={[store.longitude!, store.latitude!]}
                      pinImage={pinImage}
                    />
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
        selectedLocation={selectedLocation}
      />
    </SafeAreaView>
  );
}
