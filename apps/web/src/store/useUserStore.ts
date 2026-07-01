import { create } from 'zustand';

import type { User } from '@repo/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const INITIAL_STATE: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...INITIAL_STATE,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(INITIAL_STATE),
}));
