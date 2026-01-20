import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useLocationSearch } from '../useLocationSearch';
import { searchLocations } from '@/api/locations';
import { logger } from '@/utils/logger';

jest.mock('@/api/locations');
jest.mock('@/utils/logger');

const mockSearchLocations = searchLocations as jest.Mock;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useLocationSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLocationSearch());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('should update searchQuery', () => {
    const { result } = renderHook(() => useLocationSearch());

    act(() => {
      result.current.setSearchQuery('New York');
    });

    expect(result.current.searchQuery).toBe('New York');
  });

  it('should perform search after debounce', async () => {
    const mockResults = [{ id: '1', display_name: 'New York' }];
    mockSearchLocations.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useLocationSearch());

    act(() => {
      result.current.setSearchQuery('New York');
    });

    expect(result.current.isSearching).toBe(false);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
        expect(result.current.isSearching).toBe(true);
    });

    await waitFor(() => {
      expect(mockSearchLocations).toHaveBeenCalledWith('New York', 3);
      expect(result.current.searchResults).toEqual(mockResults);
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('should not search if query is empty', () => {
    const { result } = renderHook(() => useLocationSearch());

    act(() => {
      result.current.setSearchQuery('  ');
    });

    act(() => {
        jest.advanceTimersByTime(300);
    });


    expect(mockSearchLocations).not.toHaveBeenCalled();
  });

  it('should handle search API errors', async () => {
    const error = new Error('API Error');
    mockSearchLocations.mockRejectedValue(error);

    const { result } = renderHook(() => useLocationSearch());

    act(() => {
      result.current.setSearchQuery('error');
    });

    act(() => {
        jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
        expect(result.current.isSearching).toBe(true);
    });


    await waitFor(() => {
      expect(mockLogger.error).toHaveBeenCalledWith('useLocationSearch', 'Error searching locations', error);
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useLocationSearch());

    act(() => {
      result.current.setSearchQuery('New York');
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
  });
});
