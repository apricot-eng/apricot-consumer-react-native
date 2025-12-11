import { getUserLocation, UserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  currentLocation: UserLocation | null;
  currentNeighbourhood: string;
  isLoadingLocation: boolean;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const loadLocation = useCallback(async () => {
    try {
      setIsLoadingLocation(true);
      const location = await getUserLocation();
      if (location) {
        setCurrentLocation(location);
      } else {
        // Use default location
        setCurrentLocation({
          location_id: 0,
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
          location: {
            lat: DEFAULT_LOCATION.lat,
            lon: DEFAULT_LOCATION.lon,
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
      }
    } catch (error: any) {
      // On error, use default location
      if (error.response?.status === 404) {
        setCurrentLocation({
          location_id: 0,
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
          location: {
            lat: DEFAULT_LOCATION.lat,
            lon: DEFAULT_LOCATION.lon,
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
      }
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation, refreshTrigger]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    loadLocation();
  }, [loadLocation]);

  const currentNeighbourhood = currentLocation?.location?.address?.neighbourhood || 
                               DEFAULT_LOCATION.neighbourhood;

  return (
    <LocationContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh, 
      currentLocation,
      currentNeighbourhood,
      isLoadingLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return context;
};
