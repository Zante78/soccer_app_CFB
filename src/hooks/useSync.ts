import { useState, useEffect } from 'react';
import { SyncManager } from '../services/offline/SyncManager';
import { NetworkStatus } from '../services/offline/NetworkStatus';

const syncManager = new SyncManager();
const networkStatus = new NetworkStatus();

export function useSync() {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = networkStatus.onStatusChange((online) => {
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  const sync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncManager.forceSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    sync,
  };
}