import { useQuery } from '@tanstack/react-query';
import { restaurantDetailApi } from '@repo/api';
import { storeKeys } from './useStore';

/**
 * Custom hook to get the restaurant commission rate.
 * Defaults to 15 if not loaded or if API fails.
 */
export function useRestaurantCommission() {
  const query = useQuery({
    queryKey: [...storeKeys.all, 'commission'] as const,
    queryFn: async () => {
      const response = await restaurantDetailApi.getMyRestaurant();
      if (response.statusCode !== 200 || !response.data) {
        throw new Error('Failed to fetch restaurant commission rate');
      }
      
      const detail = response.data;
      
      // If commissionRate exists, return it, otherwise fallback to 15
      return detail.commissionRate ?? 15;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    commissionRate: query.data ?? 15,
    isLoading: query.isLoading,
    error: query.error,
  };
}
