import { supabase } from './database';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PlayerDB extends DBSchema {
  players: {
    key: string;
    value: any;
    indexes: { 'by-team': string };
  };
  evaluations: {
    key: string;
    value: any;
    indexes: { 'by-player': string };
  };
  notes: {
    key: string;
    value: any;
    indexes: { 'by-player': string };
  };
}

export class SyncService {
  private db: IDBPDatabase<PlayerDB>;

  async initialize() {
    this.db = await openDB<PlayerDB>('player-evaluation-app', 1, {
      upgrade(db) {
        // Create object stores
        const playerStore = db.createObjectStore('players', { keyPath: 'id' });
        playerStore.createIndex('by-team', 'teamId');

        const evaluationStore = db.createObjectStore('evaluations', { keyPath: 'id' });
        evaluationStore.createIndex('by-player', 'playerId');

        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-player', 'playerId');
      },
    });
  }

  async syncToServer() {
    // Get all local changes
    const players = await this.db.getAll('players');
    const evaluations = await this.db.getAll('evaluations');
    const notes = await this.db.getAll('notes');

    // Sync to Supabase
    const { error: playersError } = await supabase
      .from('players')
      .upsert(players);
    if (playersError) throw playersError;

    const { error: evaluationsError } = await supabase
      .from('evaluations')
      .upsert(evaluations);
    if (evaluationsError) throw evaluationsError;

    const { error: notesError } = await supabase
      .from('notes')
      .upsert(notes);
    if (notesError) throw notesError;
  }

  async syncFromServer() {
    // Get latest data from server
    const { data: players } = await supabase.from('players').select('*');
    const { data: evaluations } = await supabase.from('evaluations').select('*');
    const { data: notes } = await supabase.from('notes').select('*');

    // Update local database
    const tx = this.db.transaction(['players', 'evaluations', 'notes'], 'readwrite');
    
    await Promise.all([
      tx.objectStore('players').clear(),
      tx.objectStore('evaluations').clear(),
      tx.objectStore('notes').clear(),
    ]);

    await Promise.all([
      ...players!.map(p => tx.objectStore('players').add(p)),
      ...evaluations!.map(e => tx.objectStore('evaluations').add(e)),
      ...notes!.map(n => tx.objectStore('notes').add(n)),
    ]);

    await tx.done;
  }

  async getOfflineData(playerId: string) {
    return {
      player: await this.db.get('players', playerId),
      evaluations: await this.db.getAllFromIndex('evaluations', 'by-player', playerId),
      notes: await this.db.getAllFromIndex('notes', 'by-player', playerId),
    };
  }
}