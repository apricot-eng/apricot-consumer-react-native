import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useStoreSearch } from '../useStoreSearch';
import { getStoresNearby } from '@/api/stores';
import { logger } from '@/utils/logger';

jest.mock('@/api/stores');
jest.mock('@/utils/logger');

const mockGetStoresNearby = getStoresNearby as jest.Mock;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useStoreSearch', () => {
  const center: [number, number] = [-58.4245236, -34.5803362];
  const radius = 2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useStoreSearch());

    expect(result.current.stores).toEqual([]);
    expect(result.current.loadingStores).toBe(false);
  });

  it('should fetch stores successfully', async () => {
    const mockStores = [{ id: '1', store_name: 'Store 1' }];
    mockGetStoresNearby.mockResolvedValue(mockStores);

    const { result } = renderHook(() => useStoreSearch());

    await act(async () => {
      await result.current.fetchStores(center, radius);
    });

    expect(result.current.loadingStores).toBe(false);
    expect(result.current.stores).toEqual(mockStores);
    expect(mockGetStoresNearby).toHaveBeenCalledTimes(1);
  });

  it('should not fetch if already loading', async () => {
    // Mock getStoresNearby to return a promise that never resolves
    const pendingPromise = new Promise(() => {}); 
    mockGetStoresNearby.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useStoreSearch());

    // Trigger the first fetch
    act(() => {
      result.current.fetchStores(center, radius);
    });

    // Expect loading state to be true
    await waitFor(() => {
      expect(result.current.loadingStores).toBe(true);
    });

    // Trigger a second fetch while the first is still pending
    act(() => {
      result.current.fetchStores(center, radius);
    });

    // Assert that getStoresNearby was only called once
    expect(mockGetStoresNearby).toHaveBeenCalledTimes(1);

    // No need to await pendingPromise, as we are only testing that fetchStores is not called again
  });

  it('should not fetch if center and radius are the same as last fetch', async () => {
    mockGetStoresNearby.mockResolvedValue([]);

    const { result } = renderHook(() => useStoreSearch());

    await act(async () => {
      await result.current.fetchStores(center, radius);
    });

    await act(async () => {
      await result.current.fetchStores(center, radius);
    });

    expect(mockGetStoresNearby).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockGetStoresNearby.mockRejectedValue(error);

    const { result } = renderHook(() => useStoreSearch());

    await act(async () => {
      await result.current.fetchStores(center, radius);
    });

    expect(result.current.loadingStores).toBe(false);
    expect(result.current.stores).toEqual([]);
    expect(mockLogger.error).toHaveBeenCalledWith('useStoreSearch', 'Error fetching stores', error, { center, radiusKm: radius });
  });

  it('should not fetch if coordinates are invalid', async () => {
    const { result } = renderHook(() => useStoreSearch());

    // Use truly invalid coordinates
    await act(async () => {
      await result.current.fetchStores([999, 999], radius);
    });

    expect(mockGetStoresNearby).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith('useStoreSearch', 'Skipping fetch - invalid coordinates');
  });
});
