import { useState, useEffect } from 'react';
import { OfflineManager } from '../services/offline/OfflineManager';
import { NetworkStatus } from '../services/offline/NetworkStatus';

const offlineManager = new OfflineManager();
const networkStatus = new NetworkStatus();

export function useOffline() {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = networkStatus.onStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        setIsSyncing(true);
        // Trigger sync when coming back online
        syncData().finally(() => setIsSyncing(false));
      }
    });

    return () => unsubscribe();
  }, []);

  const syncData = async () => {
    // Implement your sync logic here
    // This should handle bidirectional sync
    try {
      // Sync local changes to server
      // Fetch new changes from server
      // Update local database
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  };

  return {
    isOnline,
    isSyncing,
    offlineManager,
    syncData,
  };
}