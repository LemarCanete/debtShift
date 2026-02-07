import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager, focusManager } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';

/**
 * Hook to manage offline state and React Query configuration
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      setIsConnected(state.isInternetReachable ?? online);

      // Tell React Query about the network state
      onlineManager.setOnline(online);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Tell React Query to refetch when app comes to foreground
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        if (Platform.OS !== 'web') {
          focusManager.setFocused(status === 'active');
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return {
    isOnline,
    isConnected,
  };
}

/**
 * Hook to track if there are pending mutations
 */
export function usePendingMutations() {
  const [hasPending, setHasPending] = useState(false);

  // This would be enhanced with persistence to track offline mutations
  // For MVP, we'll just track the current session

  return {
    hasPending,
    setHasPending,
  };
}

/**
 * Configure React Query for offline support
 */
export function configureOfflineSupport() {
  // Set online manager to use NetInfo
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
  });
}

export default useOffline;
