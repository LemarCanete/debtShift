import { create } from 'zustand';
import type { User } from '@/types/database';
import * as authService from '@/services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  initialize: async () => {
    set({ isLoading: true });

    const { data: user, error } = await authService.getCurrentUser();

    if (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error.message,
      });
      return;
    }

    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await authService.signUp(email, password);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    // After signup, fetch the user profile
    const { data: user } = await authService.getCurrentUser();

    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });

    return true;
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await authService.signIn(email, password);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    // After signin, fetch the user profile
    const { data: user } = await authService.getCurrentUser();

    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });

    return true;
  },

  signOut: async () => {
    set({ isLoading: true });

    await authService.signOut();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    const { error } = await authService.resetPassword(email);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set({ isLoading: false });
    return true;
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();

    if (!user) {
      set({ error: 'Not authenticated' });
      return false;
    }

    set({ isLoading: true, error: null });

    const { data: updatedUser, error } = await authService.updateProfile(
      user.id,
      updates
    );

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set({
      user: updatedUser,
      isLoading: false,
      error: null,
    });

    return true;
  },

  clearError: () => set({ error: null }),

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
}));

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsOnboardingCompleted = () =>
  useAuthStore((state) => state.user?.onboarding_completed ?? false);
