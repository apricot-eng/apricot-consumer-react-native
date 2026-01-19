import { LocationSearchResult, UserLocation } from '@/api/locations';
import { MapBounds } from '@/api/stores';
import { DEFAULT_LOCATION } from '@/constants/location';
import { LocationData } from '@/types/location';
import { logger } from '@/utils/logger';

/**
 * Validates coordinates to ensure they are valid for MapLibre
 * MapLibre requires valid, finite numbers within coordinate ranges
 * @param lat - Latitude value
 * @param long - Longitude value
 * @returns true if coordinates are valid, false otherwise
 */
export const isValidCoordinate = (lat?: number, long?: number): boolean => {
  if (lat === undefined || long === undefined) return false;
  if (typeof lat !== 'number' || typeof long !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(long)) return false;
  // Valid latitude range: -90 to 90
  // Valid longitude range: -180 to 180
  return lat >= -90 && lat <= 90 && long >= -180 && long <= 180;
};

/**
 * Calculate bounding box from center point and radius (in km)
 * The API requires bounds, so we convert center+radius to N/S/E/W bounds
 * @param center - Center point as [longitude, latitude]
 * @param radiusKm - Radius in kilometers
 * @returns MapBounds object with north, south, east, west coordinates
 */
export const calculateBoundsFromCenter = (
  center: [number, number],
  radiusKm: number
): MapBounds => {
  const [centerLon, centerLat] = center;
  
  // Approximate conversion: 1 degree latitude ≈ 111 km
  // Longitude varies by latitude, so we use the latitude to adjust
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));
  
  return {
    north: centerLat + latDelta,
    south: centerLat - latDelta,
    east: centerLon + lonDelta,
    west: centerLon - lonDelta,
  };
};

/**
 * Convert distance radius (in km) to appropriate MapLibre zoom level
 * Zoom level decreases as distance increases to show larger area
 * @param distanceKm - Distance radius in kilometers
 * @returns Zoom level (typically 11-16 for 0-50km range)
 */
export const distanceToZoomLevel = (distanceKm: number): number => {
  if (distanceKm <= 1) return 16;
  if (distanceKm <= 2) return 15;
  if (distanceKm <= 5) return 14;
  if (distanceKm <= 10) return 13;
  if (distanceKm <= 20) return 12;
  return 11; // For 20-50km
};

/**
 * Validates and converts coordinates from a LocationSearchResult
 * Logs errors if coordinates are invalid but does not show user-facing toasts
 * @param location - LocationSearchResult to validate
 * @returns Valid coordinate tuple [longitude, latitude] or null if invalid
 */
export const validateAndConvertCoordinates = (
  location: LocationSearchResult
): [number, number] | null => {
  const lat = Number(location.lat);
  const long = Number(location.long);
  
  if (!isValidCoordinate(lat, long)) {
    logger.error('LOCATION_UTILS', 'Invalid coordinates from search result', {
      lat: location.lat,
      long: location.long,
      display_name: location.display_name,
      convertedLat: lat,
      convertedLong: long
    });
    return null;
  }

  return [long, lat];
};

/**
 * Creates a UserLocation object with default location values
 * @returns UserLocation object with DEFAULT_LOCATION values
 */
export const getDefaultUserLocation = (): UserLocation => ({
  location_id: 0,
  lat: DEFAULT_LOCATION.lat,
  long: DEFAULT_LOCATION.long,
  location: {
    lat: DEFAULT_LOCATION.lat,
    long: DEFAULT_LOCATION.long,
    display_name: DEFAULT_LOCATION.display_name,
    address: {
      neighbourhood: DEFAULT_LOCATION.neighbourhood,
      city: DEFAULT_LOCATION.city,
      state: DEFAULT_LOCATION.state,
      country: DEFAULT_LOCATION.country,
    },
    place_id: DEFAULT_LOCATION.place_id,
  },
});

/**
 * Converts a LocationSearchResult to LocationData format
 * @param selectedLocation - Location search result to convert
 * @returns LocationData object ready for saving
 */
export const locationSearchResultToLocationData = (
  selectedLocation: LocationSearchResult
): LocationData => {
  return {
    lat: selectedLocation.lat,
    long: selectedLocation.long,
    place_id: selectedLocation.place_id,
    display_name: selectedLocation.display_name,
    address_components: {
      neighbourhood: selectedLocation.address.neighbourhood,
      city: selectedLocation.address.city,
    },
  };
};
