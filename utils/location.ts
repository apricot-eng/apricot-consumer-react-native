import { MapBounds } from '@/api/stores';

/**
 * Validates coordinates to ensure they are valid for MapLibre
 * MapLibre requires valid, finite numbers within coordinate ranges
 * @param lat - Latitude value
 * @param lon - Longitude value
 * @returns true if coordinates are valid, false otherwise
 */
export const isValidCoordinate = (lat?: number, lon?: number): boolean => {
  if (lat === undefined || lon === undefined) return false;
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  // Valid latitude range: -90 to 90
  // Valid longitude range: -180 to 180
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
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
