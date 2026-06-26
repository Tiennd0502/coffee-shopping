'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { fetchUser } from '@/services/user';
import { useUserStore } from '@/store/useUserStore';

export const useAuth = () => {
  const { isLoaded, isSignedIn } = useClerkAuth();

  const [user, setUser, isLoading, error, setLoading, setError, reset] = useUserStore(
    useShallow((state) => [
      state.user,
      state.setUser,
      state.isLoading,
      state.error,
      state.setLoading,
      state.setError,
      state.reset,
    ]),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchUser();

    if (result.ok) {
      setUser(result?.user);
    } else {
      setUser(null);
      setError(result.error);
    }
    setLoading(false);
  }, [setError, setLoading, setUser]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      reset();
      setError(null);
      return;
    }
    void load();
  }, [isLoaded, isSignedIn, reset, load]);

  return {
    user,
    isLoading,
    error,
    refetch: load,
    isSignedIn,
    isAuthLoaded: isLoaded,
  };
};
