import { DatabaseManager } from './DatabaseManager';
import { NetworkStatus } from './NetworkStatus';
import { supabase } from '../database';

export class SyncManager {
  private databaseManager: DatabaseManager;
  private networkStatus: NetworkStatus;
  private syncInProgress = false;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.networkStatus = new NetworkStatus();
    this.initialize();
  }

  private async initialize() {
    await this.databaseManager.initialize();
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    this.networkStatus.onStatusChange(async (online) => {
      if (online && !this.syncInProgress) {
        await this.syncPendingChanges();
      }
    });
  }

  async syncPendingChanges() {
    if (this.syncInProgress || !this.networkStatus.isOnline()) {
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingItems = await this.databaseManager.getPendingSyncItems();

      // Sync players
      for (const player of pendingItems.players) {
        const { error } = await supabase
          .from('players')
          .upsert(player);
        
        if (!error) {
          await this.databaseManager.markAsSynced('players', player.id);
        }
      }

      // Sync statistics
      for (const stat of pendingItems.statistics) {
        const { error } = await supabase
          .from('match_statistics')
          .upsert(stat);
        
        if (!error) {
          await this.databaseManager.markAsSynced('statistics', stat.id);
        }
      }

      // Sync notes
      for (const note of pendingItems.notes) {
        const { error } = await supabase
          .from('notes')
          .upsert(note);
        
        if (!error) {
          await this.databaseManager.markAsSynced('notes', note.id);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async forceSync() {
    return this.syncPendingChanges();
  }
}