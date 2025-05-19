import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Player } from '../../types/player';
import { GameStatistics, Note } from '../../types/statistics';

interface PlayerDB extends DBSchema {
  players: {
    key: string;
    value: Player & { _syncStatus?: 'pending' | 'synced' };
    indexes: { 'by-sync-status': string };
  };
  statistics: {
    key: string;
    value: GameStatistics & { _syncStatus?: 'pending' | 'synced' };
    indexes: { 'by-player': string; 'by-sync-status': string };
  };
  notes: {
    key: string;
    value: Note & { _syncStatus?: 'pending' | 'synced' };
    indexes: { 'by-player': string; 'by-sync-status': string };
  };
}

export class DatabaseManager {
  private db: IDBPDatabase<PlayerDB>;

  async initialize() {
    this.db = await openDB<PlayerDB>('football-manager', 1, {
      upgrade(db) {
        // Players store
        const playerStore = db.createObjectStore('players', { keyPath: 'id' });
        playerStore.createIndex('by-sync-status', '_syncStatus');

        // Statistics store
        const statsStore = db.createObjectStore('statistics', { keyPath: 'id' });
        statsStore.createIndex('by-player', 'playerId');
        statsStore.createIndex('by-sync-status', '_syncStatus');

        // Notes store
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-player', 'playerId');
        notesStore.createIndex('by-sync-status', '_syncStatus');
      },
    });
  }

  async storePlayer(player: Player) {
    await this.db.put('players', { ...player, _syncStatus: 'pending' });
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return await this.db.get('players', id);
  }

  async getPendingSyncItems() {
    const [players, statistics, notes] = await Promise.all([
      this.db.getAllFromIndex('players', 'by-sync-status', 'pending'),
      this.db.getAllFromIndex('statistics', 'by-sync-status', 'pending'),
      this.db.getAllFromIndex('notes', 'by-sync-status', 'pending'),
    ]);

    return { players, statistics, notes };
  }

  async markAsSynced(table: 'players' | 'statistics' | 'notes', id: string) {
    const item = await this.db.get(table, id);
    if (item) {
      await this.db.put(table, { ...item, _syncStatus: 'synced' });
    }
  }
}