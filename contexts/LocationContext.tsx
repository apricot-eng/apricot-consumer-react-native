import { getUserLocation, UserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import { getDefaultUserLocation } from '@/utils/location';
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
        setCurrentLocation(getDefaultUserLocation());
      }
    } catch (error: any) {
      // On error, use default location
      if (error.response?.status === 404) {
        setCurrentLocation(getDefaultUserLocation());
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
