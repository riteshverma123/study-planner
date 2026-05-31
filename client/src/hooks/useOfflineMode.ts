import { useEffect, useState, useCallback } from "react";
import { isOfflineMode, setOfflineMode, initializeOfflineStorage } from "@/lib/offlineStorage";

/**
 * Hook to manage offline mode state and connectivity
 */
export function useOfflineMode() {
  const [offline, setOffline] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize offline storage
    initializeOfflineStorage();
    setOffline(isOfflineMode());
    setInitialized(true);

    // Listen for online/offline events
    const handleOnline = () => {
      setOffline(false);
      setOfflineMode(false);
    };

    const handleOffline = () => {
      setOffline(true);
      setOfflineMode(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleOfflineMode = useCallback((enabled: boolean) => {
    setOfflineMode(enabled);
    setOffline(enabled);
  }, []);

  return {
    offline,
    initialized,
    toggleOfflineMode,
    isOnline: !offline,
  };
}
