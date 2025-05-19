import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Player } from '../../types/player';
import { GameStatistics, Note } from '../../types/statistics';
import { SyncQueue } from './SyncQueue';
import { NetworkStatus } from './NetworkStatus';

interface PlayerDB extends DBSchema {
  players: {
    key: string;
    value: Player;
    indexes: { 'by-team': string };
  };
  statistics: {
    key: string;
    value: GameStatistics;
    indexes: { 'by-player': string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-player': string };
  };
}

export class OfflineManager {
  private db: IDBPDatabase<PlayerDB>;
  private syncQueue: SyncQueue;
  private networkStatus: NetworkStatus;

  constructor() {
    this.syncQueue = new SyncQueue();
    this.networkStatus = new NetworkStatus();
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    this.db = await openDB<PlayerDB>('football-manager', 1, {
      upgrade(db) {
        // Players store
        const playerStore = db.createObjectStore('players', { keyPath: 'id' });
        playerStore.createIndex('by-team', 'teamId');

        // Statistics store
        const statsStore = db.createObjectStore('statistics', { keyPath: 'id' });
        statsStore.createIndex('by-player', 'playerId');

        // Notes store
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-player', 'playerId');
      },
    });
  }

  async storePlayer(player: Player) {
    await this.db.put('players', player);
    if (this.networkStatus.isOnline()) {
      await this.syncQueue.addToQueue('players', 'upsert', player);
    }
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return await this.db.get('players', id);
  }

  async storeStatistics(stats: GameStatistics) {
    await this.db.put('statistics', stats);
    if (this.networkStatus.isOnline()) {
      await this.syncQueue.addToQueue('statistics', 'upsert', stats);
    }
  }

  async getPlayerStatistics(playerId: string): Promise<GameStatistics[]> {
    return await this.db.getAllFromIndex('statistics', 'by-player', playerId);
  }

  async storeNote(note: Note) {
    await this.db.put('notes', note);
    if (this.networkStatus.isOnline()) {
      await this.syncQueue.addToQueue('notes', 'upsert', note);
    }
  }

  async getPlayerNotes(playerId: string): Promise<Note[]> {
    return await this.db.getAllFromIndex('notes', 'by-player', playerId);
  }

  async clearOfflineData() {
    const tx = this.db.transaction(['players', 'statistics', 'notes'], 'readwrite');
    await Promise.all([
      tx.objectStore('players').clear(),
      tx.objectStore('statistics').clear(),
      tx.objectStore('notes').clear(),
    ]);
    await tx.done;
  }
}