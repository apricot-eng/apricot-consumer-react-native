import { LocationSearchResult } from '@/api/locations';
import { LocationData } from '@/types/location';
import { useEffect, useState } from 'react';

/**
 * Hook to manage the state of the location selection screen.
 * Handles the selected location, search radius distance, and saving state.
 * Syncs the initial distance with the user's existing location preference.
 *
 * @param userLocation The current user location data, if any.
 */
export function useLocationSelection(userLocation: LocationData | null) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  // Default to 2km or the user's saved radius
  const [distance, setDistance] = useState(userLocation?.location_radius || 2);
  const [saving, setSaving] = useState(false);

  // Sync distance with user location when it loads
  useEffect(() => {
    if (userLocation?.location_radius) {
      setDistance(userLocation.location_radius);
    }
  }, [userLocation?.location_radius]);

  return {
    selectedLocation,
    setSelectedLocation,
    distance,
    setDistance,
    saving,
    setSaving,
  };
}
