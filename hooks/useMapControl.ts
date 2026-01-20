import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, MapView } from '@maplibre/maplibre-react-native';
import { isValidCoordinate } from '@/utils/location';
import { logger } from '@/utils/logger';
import { LocationData } from '@/types/location';

const DEFAULT_CENTER: [number, number] = [-58.4245236, -34.5803362];
const DEFAULT_ZOOM = 12;

export function useMapControl(initialLocation: LocationData | null) {
  const mapRef = useRef<React.ComponentRef<typeof MapView>>(null);
  const cameraRef = useRef<React.ComponentRef<typeof Camera>>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (initialLocation && isValidCoordinate(initialLocation.lat, initialLocation.long)) {
      return [initialLocation.long, initialLocation.lat];
    }
    return DEFAULT_CENTER;
  });
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    if (initialLocation && isValidCoordinate(initialLocation.lat, initialLocation.long)) {
      const center: [number, number] = [initialLocation.long, initialLocation.lat];
      setMapCenter(center);
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: center,
          zoomLevel: DEFAULT_ZOOM,
          animationDuration: 0,
        });
      }
    }
  }, [initialLocation]);

  const centerOnCoordinates = useCallback((coords: [number, number], zoom: number, animated = true) => {
    if (isValidCoordinate(coords[1], coords[0])) {
      setMapCenter(coords);
      setMapZoom(zoom);
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: coords,
          zoomLevel: zoom,
          animationDuration: animated ? 1000 : 0,
          animationMode: 'easeTo',
        });
      }
    }
  }, []);

  const handleRegionDidChange = useCallback(async (onRegionChanged: (center: [number, number]) => void) => {
    if (!mapRef.current) return;

    try {
      const bounds = await mapRef.current.getVisibleBounds();
      if (bounds && bounds.length >= 2 && bounds[0] && bounds[1]) {
        const swLon = Number(bounds[0][0]);
        const swLat = Number(bounds[0][1]);
        const neLon = Number(bounds[1][0]);
        const neLat = Number(bounds[1][1]);
        
        const centerLon = (neLon + swLon) / 2;
        const centerLat = (neLat + swLat) / 2;
        
        if (isValidCoordinate(centerLat, centerLon)) {
          const newCenter: [number, number] = [centerLon, centerLat];
          
          const latDiff = Math.abs(newCenter[1] - mapCenter[1]);
          const lonDiff = Math.abs(newCenter[0] - mapCenter[0]);
          const threshold = 0.001;
          
          if (latDiff > threshold || lonDiff > threshold) {
            setMapCenter(newCenter);
            onRegionChanged(newCenter);
          }
        } else {
          logger.warn('useMapControl', 'Invalid center coordinates from bounds', { bounds, centerLon, centerLat });
        }
      } else {
        logger.warn('useMapControl', 'Invalid bounds array from map', { bounds });
      }
    } catch (error) {
      logger.error('useMapControl', 'Error getting map bounds', error);
    }
  }, [mapCenter]);

  return {
    mapRef,
    cameraRef,
    mapCenter,
    mapZoom,
    setMapZoom,
    centerOnCoordinates,
    handleRegionDidChange,
  };
}
