import { LocationSearchResult, saveUserLocation, searchLocations } from '@/api/locations';
import { getStoresNearby, MapBounds, Store } from '@/api/stores';
import { useLocationContext } from '@/contexts/LocationContext';
import { markLocationAsSet, useUserLocation } from '@/hooks/useUserLocation';
import { t } from '@/i18n';
import { getMapPinImage } from '@/utils/mapPins';
import { showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';
import Slider from '@react-native-community/slider';
import { Image as ExpoImage } from 'expo-image';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Default center on Buenos Aires
const DEFAULT_CENTER: [number, number] = [-58.4280328, -34.5912554];
const DEFAULT_ZOOM = 12;

// MapLibre style URL (using a free style)
const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

export default function LocationScreen() {
  const { refresh } = useUserLocation();
  const { triggerRefresh } = useLocationContext();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch stores when map bounds change
  const fetchStoresForBounds = useCallback(async (bounds: MapBounds) => {
    try {
      setLoadingStores(true);
      const nearbyStores = await getStoresNearby(bounds);
      setStores(nearbyStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  }, []);

  // Handle map region change (debounced)
  const handleRegionDidChange = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const bounds = await mapRef.current.getVisibleBounds();
      if (bounds) {
        const mapBounds: MapBounds = {
          north: bounds[1],
          south: bounds[3],
          east: bounds[2],
          west: bounds[0],
        };
        fetchStoresForBounds(mapBounds);
      }
    } catch (error) {
      console.error('Error getting map bounds:', error);
    }
  }, [fetchStoresForBounds]);

  // Initial store fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRegionDidChange();
    }, 1000); // Wait for map to initialize

    return () => clearTimeout(timer);
  }, []);

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
          onCameraChanged={handleRegionDidChange}
          onMapIdle={handleRegionDidChange}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: mapCenter,
              zoomLevel: mapZoom,
            }}
          />

          {/* Store Pins */}
          {stores
            .filter(store => store.latitude && store.longitude)
            .map(store => (
              <PointAnnotation
                key={store.id}
                id={`store-${store.id}`}
                coordinate={[store.longitude!, store.latitude!]}
              >
                <View style={styles.pinContainer}>
                  <ExpoImage
                    source={getMapPinImage(store.category || 'cafe')}
                    style={styles.pinImage}
                    contentFit="contain"
                  />
                </View>
              </PointAnnotation>
            ))}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '50%',
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchLoader: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  searchResults: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  noResultsText: {
    padding: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#794509',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#794509',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pinContainer: {
    width: 28,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinImage: {
    width: 28,
    height: 37,
  },
});
