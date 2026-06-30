'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

// Types
import type { ResponsSuccess, User } from '@repo/types';

// Constants
import { API_ROUTES } from '@/constants/routes';
import { LIST_QUERY_GC_MS, LIST_QUERY_STALE_MS } from '@/constants/common';

// Services
import { apiClient } from '@/services/api';

// Stores
import { useUserStore } from '@/store/useUserStore';

export const useAuth = () => {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const queryClient = useQueryClient();
  const [setUser, reset] = useUserStore(useShallow((state) => [state.setUser, state.reset]));

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get<ResponsSuccess<User>>(API_ROUTES.ME),
    staleTime: LIST_QUERY_STALE_MS,
    gcTime: LIST_QUERY_GC_MS,
    placeholderData: keepPreviousData,
    enabled: isLoaded && !!isSignedIn,
  });
  const { data: user } = data ?? {};

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      reset();
      queryClient.removeQueries({ queryKey: ['me'] });
    }
  }, [isLoaded, isSignedIn, reset, queryClient]);

  return {
    user,
    isLoading,
    error: error?.message,
    refetch,
    isSignedIn,
    isAuthLoaded: isLoaded,
  };
};
