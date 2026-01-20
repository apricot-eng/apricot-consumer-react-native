import { act, renderHook } from '@testing-library/react-native';
import { useMapControl } from '../useMapControl';
import { LocationData } from '@/types/location';

const mockLocation: LocationData = {
  lat: -34.5803362,
  long: -58.4245236,
  place_id: '1',
  display_name: 'Palermo, Buenos Aires',
  address_components: {
    city: 'Buenos Aires',
    neighbourhood: 'Palermo'
  }
};

describe('useMapControl', () => {
  it('should initialize with default center when no initial location', () => {
    const { result } = renderHook(() => useMapControl(null));

    expect(result.current.mapCenter).toEqual([-58.4245236, -34.5803362]);
    expect(result.current.mapZoom).toBe(12);
  });

  it('should initialize with initial location', () => {
    const { result } = renderHook(() => useMapControl(mockLocation));

    expect(result.current.mapCenter).toEqual([mockLocation.long, mockLocation.lat]);
    expect(result.current.mapZoom).toBe(12);
  });

  it('should center on coordinates', () => {
    const { result } = renderHook(() => useMapControl(null));
    const newCoords: [number, number] = [-74.006, 40.7128];

    act(() => {
      result.current.centerOnCoordinates(newCoords, 15);
    });

    expect(result.current.mapCenter).toEqual(newCoords);
    expect(result.current.mapZoom).toBe(15);
  });

  it('should not center on invalid coordinates', () => {
    const { result } = renderHook(() => useMapControl(null));
    const initialCenter = result.current.mapCenter;
    const invalidCoords: [number, number] = [999, 999];

    act(() => {
      result.current.centerOnCoordinates(invalidCoords, 15);
    });

    expect(result.current.mapCenter).toEqual(initialCenter);
  });

  it('should handle region did change', async () => {
    const { result } = renderHook(() => useMapControl(mockLocation));
    const onRegionChanged = jest.fn();

    const mockBounds: [[number, number], [number, number]] = [
      [-58.5, -34.6],
      [-58.3, -34.5],
    ];

    result.current.mapRef.current = {
      getVisibleBounds: jest.fn().mockResolvedValue(mockBounds),
    } as any;

    await act(async () => {
      await result.current.handleRegionDidChange(onRegionChanged);
    });
    
    const newCenterLon = (-58.3 + -58.5) / 2;
    const newCenterLat = (-34.5 + -34.6) / 2;

    expect(onRegionChanged).toHaveBeenCalledWith([newCenterLon, newCenterLat]);
    expect(result.current.mapCenter).toEqual([newCenterLon, newCenterLat]);
  });
});
