import { getUserLocation, saveUserLocationApi, UserLocation } from '@/api/locations';
import { DEFAULT_LOCATION } from '@/constants/location';
import { LocationContext } from '@/contexts/LocationContext';
import { LocationData } from '@/types/location';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { cacheUserLocation, useUserLocation } from '../useUserLocation';

// Mock dependencies
jest.mock('@/api/locations');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@/utils/logger');

const mockGetUserLocation = getUserLocation as jest.MockedFunction<typeof getUserLocation>;
const mockSaveUserLocationApi = saveUserLocationApi as jest.MockedFunction<typeof saveUserLocationApi>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Helper to flush all pending updates
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Helper to wait for condition and flush all updates
const waitForAndFlush = async (condition: () => void) => {
  await waitFor(condition);
  await act(async () => {
    await flushPromises();
  });
};

describe('useUserLocation', () => {
  const CACHED_LOCATION_KEY = 'user_location_cached';

  // Mock location data
  const mockUserLocation: UserLocation = {
    lat: -34.5912554,
    long: -58.4280328,
    location_id: 1,
    location: {
      lat: -34.5912554,
      long: -58.4280328,
      place_id: '123456',
      display_name: 'Palermo, Buenos Aires, Argentina',
      address: {
        neighbourhood: 'Palermo',
        city: 'Buenos Aires',
      },
    },
  };

  const mockLocationData: LocationData = {
    lat: -34.5912554,
    long: -58.4280328,
    place_id: '123456',
    display_name: 'Palermo, Buenos Aires, Argentina',
    address_components: {
      neighbourhood: 'Palermo',
      city: 'Buenos Aires',
    },
  };

  const defaultLocationData: LocationData = {
    lat: DEFAULT_LOCATION.lat,
    long: DEFAULT_LOCATION.long,
    place_id: null,
    display_name: DEFAULT_LOCATION.display_name,
    address_components: {
      neighbourhood: DEFAULT_LOCATION.neighbourhood,
      city: DEFAULT_LOCATION.city,
    },
  };

  // Mock LocationContext provider
  const createWrapper = (refreshTrigger: number = 0) => {
    return ({ children }: { children: React.ReactNode }) => (
      <LocationContext.Provider 
        value={{ 
          refreshTrigger, 
          triggerRefresh: jest.fn(), 
          currentLocation: null, 
          currentNeighbourhood: DEFAULT_LOCATION.neighbourhood, 
          isLoadingLocation: false 
        }}
      >
        {children}
      </LocationContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    mockGetUserLocation.mockResolvedValue(null);
    mockSaveUserLocationApi.mockResolvedValue(mockUserLocation);
  });

  describe('userLocationToLocationData', () => {
    it('should convert UserLocation to LocationData correctly', async () => {
      // This function is not exported, so we test it indirectly through useUserLocation
      // We'll verify the conversion happens correctly when getUserLocation returns data
      const userLocation: UserLocation = {
        lat: -34.5912554,
        long: -58.4280328,
        location_id: 1,
        location: {
          lat: -34.5912554,
          long: -58.4280328,
          place_id: '123456',
          display_name: 'Test Location',
          address: {
            neighbourhood: 'Test Neighbourhood',
            city: 'Test City',
          },
        },
      };

      mockGetUserLocation.mockResolvedValue(userLocation);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.hasLocation).toBe(true);
        // Verify the location was saved to cache with correct format
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          CACHED_LOCATION_KEY,
          JSON.stringify({
            lat: userLocation.lat,
            long: userLocation.long,
            place_id: userLocation.location.place_id,
            display_name: userLocation.location.display_name,
            address_components: {
              neighbourhood: userLocation.location.address.neighbourhood,
              city: userLocation.location.address.city,
            },
          })
        );
      });
      await act(async () => {
        await flushPromises();
      });
    });

    it('should handle UserLocation with null place_id', () => {
      const userLocation: UserLocation = {
        lat: -34.5912554,
        long: -58.4280328,
        location_id: 1,
        location: {
          lat: -34.5912554,
          long: -58.4280328,
          place_id: null,
          display_name: 'Test Location',
          address: {
            neighbourhood: 'Test Neighbourhood',
            city: 'Test City',
          },
        },
      };

      mockGetUserLocation.mockResolvedValue(userLocation);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      return waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          CACHED_LOCATION_KEY,
          JSON.stringify({
            lat: userLocation.lat,
            long: userLocation.long,
            place_id: null,
            display_name: userLocation.location.display_name,
            address_components: {
              neighbourhood: userLocation.location.address.neighbourhood,
              city: userLocation.location.address.city,
            },
          })
        );
      });
    });

    it('should handle UserLocation with missing address fields', () => {
      const userLocation: UserLocation = {
        lat: -34.5912554,
        long: -58.4280328,
        location_id: 1,
        location: {
          lat: -34.5912554,
          long: -58.4280328,
          place_id: '123456',
          display_name: 'Test Location',
          address: {},
        },
      };

      mockGetUserLocation.mockResolvedValue(userLocation);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      return waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          CACHED_LOCATION_KEY,
          JSON.stringify({
            lat: userLocation.lat,
            long: userLocation.long,
            place_id: userLocation.location.place_id,
            display_name: userLocation.location.display_name,
            address_components: {
              neighbourhood: '',
              city: '',
            },
          })
        );
      });
    });
  });

  describe('saveCachedLocation', () => {
    it('should save location to AsyncStorage successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      mockGetUserLocation.mockResolvedValue(mockUserLocation);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CACHED_LOCATION_KEY,
        expect.any(String)
      );
    });

    it('should handle AsyncStorage save errors', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      mockGetUserLocation.mockResolvedValue(mockUserLocation);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'USE_USER_LOCATION',
        'Failed to save cached location',
        error
      );
    });
  });

  describe('loadCachedLocation', () => {
    it('should load location from AsyncStorage successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLocationData));

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CACHED_LOCATION_KEY);
      expect(result.current.hasLocation).toBe(true);
    });

    it('should return null when no cached location exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      mockGetUserLocation.mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(CACHED_LOCATION_KEY);
    });

    it('should handle AsyncStorage load errors gracefully', async () => {
      const error = new Error('Storage read error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);
      mockGetUserLocation.mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'USE_USER_LOCATION',
        'Failed to load cached location',
        error
      );
    });

    it('should handle invalid JSON in cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      mockGetUserLocation.mockResolvedValue(null);

      const { result } = renderHook(() => useUserLocation(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should handle error and fall back to default location
      expect(result.current.hasLocation).toBe(true);
    });
  });

  // The problem child
  describe('useUserLocation hook', () => {
    describe('initialization', () => {
      it('should start with loading true', () => {
        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.hasLocation).toBe(false);
      });

      it('should set loading to false after check completes', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      });
    });

    describe('handleCachedLocation', () => {
      it('should use API location when API call succeeds', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLocationData));
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockGetUserLocation).toHaveBeenCalled();
        // Should save API location to cache
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should trust cache when API call fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockLocationData));
        mockGetUserLocation.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'USE_USER_LOCATION',
          'Location API verification failed',
          expect.any(Error)
        );
      });
    });

    describe('handleNoCachedLocation', () => {
      it('should set location state when API returns location', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should set default location when API returns null', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockSaveUserLocationApi).toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should set default location when API call fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockSaveUserLocationApi).toHaveBeenCalled();
      });
    });
/*
    describe('handleLocationError', () => {
      it('should set default location on 404 error', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue({
          response: { status: 404 },
        });

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockSaveUserLocationApi).toHaveBeenCalled();
      });

      it('should use cache on non-404 errors when cache exists', async () => {
        (AsyncStorage.getItem as jest.Mock)
          .mockRejectedValueOnce(new Error('Storage error'))
          .mockResolvedValueOnce(JSON.stringify(mockLocationData));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
      });

      it('should set default location on error when no cache exists', async () => {
        (AsyncStorage.getItem as jest.Mock)
          .mockRejectedValueOnce(new Error('Storage error'))
          .mockResolvedValueOnce(null);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockSaveUserLocationApi).toHaveBeenCalled();
      });
    });

    */

    /*
    describe('setDefaultLocation', () => {
      it('should save default location to cache and API', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);
        mockSaveUserLocationApi.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockSaveUserLocationApi).toHaveBeenCalledWith({
          lat: DEFAULT_LOCATION.lat,
          long: DEFAULT_LOCATION.long,
          place_id: DEFAULT_LOCATION.place_id || undefined,
          display_name: DEFAULT_LOCATION.display_name,
          address_components: {
            neighbourhood: DEFAULT_LOCATION.neighbourhood,
            city: DEFAULT_LOCATION.city,
          },
        });
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should handle API save failure gracefully', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);
        mockSaveUserLocationApi.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'USE_USER_LOCATION',
          'Failed to save default location to API, using cached default',
          expect.any(Error)
        );
      });

      it('should update cache with API response after successful save', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation
          .mockResolvedValueOnce(null) // First call in setDefaultLocation
          .mockResolvedValueOnce(mockUserLocation); // Second call in verifyLocationWithAPI
        mockSaveUserLocationApi.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
        // Should call setItem multiple times: once for default, once for API response
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
      });

      it('should still set hasLocation even if everything fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);
        mockSaveUserLocationApi.mockRejectedValue(new Error('API error'));
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Should still allow app to proceed
        expect(result.current.hasLocation).toBe(true);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'USE_USER_LOCATION',
          'Error setting default location',
          expect.any(Error)
        );
      });
    });
    */

    describe('verifyLocationWithAPI', () => {
      it('should return location data when API call succeeds', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockGetUserLocation).toHaveBeenCalled();
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should return null when API call fails', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(
          'USE_USER_LOCATION',
          'Location API verification failed',
          expect.any(Error)
        );
      });

      it('should return null when API returns null', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(null);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(mockGetUserLocation).toHaveBeenCalled();
      });
    });

    describe('refresh', () => {
      it('should trigger location check when refresh is called', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const initialCallCount = (AsyncStorage.getItem as jest.Mock).mock.calls.length;

        await act(async () => {
          await result.current.refresh();
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Should have called checkLocation again
        expect((AsyncStorage.getItem as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
      });

      it('should handle errors during refresh', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Make refresh fail
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Refresh error'));

        await act(async () => {
          await result.current.refresh();
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Should still complete without crashing
        expect(result.current.hasLocation).toBe(true);
      });
    });

    /*
    describe('refreshTrigger dependency', () => {
      it('should re-run checkLocation when refreshTrigger changes', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { rerender } = renderHook(() => useUserLocation(), {
          wrapper: createWrapper(0),
        });

        await waitFor(() => {
          expect(AsyncStorage.getItem).toHaveBeenCalled();
        });

        const initialCallCount = (AsyncStorage.getItem as jest.Mock).mock.calls.length;

        // Change refreshTrigger
        await act(async () => {
          rerender({ wrapper: createWrapper(1) });
        });

        await waitFor(() => {
          expect((AsyncStorage.getItem as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      });

      it('should work when LocationContext is undefined', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        mockGetUserLocation.mockResolvedValue(mockUserLocation);

        const { result } = renderHook(() => useUserLocation());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasLocation).toBe(true);
      });
    });
    */
  });

  describe('cacheUserLocation', () => {
    it('should save location to AsyncStorage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await cacheUserLocation(mockLocationData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CACHED_LOCATION_KEY,
        JSON.stringify(mockLocationData)
      );
    });

    it('should handle errors when saving location', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(cacheUserLocation(mockLocationData)).rejects.toThrow('Storage error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'USE_USER_LOCATION',
        'Failed to save cached location',
        error
      );
    });

    it('should save different location data correctly', async () => {
      const differentLocation: LocationData = {
        lat: -34.603722,
        long: -58.381592,
        place_id: '789012',
        display_name: 'San Telmo, Buenos Aires',
        address_components: {
          neighbourhood: 'San Telmo',
          city: 'Buenos Aires',
        },
      };

      await cacheUserLocation(differentLocation);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        CACHED_LOCATION_KEY,
        JSON.stringify(differentLocation)
      );
    });
  });
});
