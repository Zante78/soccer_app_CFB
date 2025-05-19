import { create } from 'zustand';
import { Player } from '../types/player';
import { PlayerService } from '../services/player.service';
import { EventBus } from '../services/events/EventBus';
import { testDatabaseConnection } from '../services/database';

interface PlayerState {
  players: Player[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  dbConnected: boolean;
  initialize: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  getPlayersByTeam: (teamId: string) => Player[];
}

let playerService: PlayerService | null = null;
try {
  playerService = PlayerService.getInstance();
} catch (err) {
  console.error('Failed to initialize PlayerService:', err);
}

const eventBus = EventBus.getInstance();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],
  loading: false,
  error: null,
  initialized: false,
  dbConnected: false,

  checkConnection: async () => {
    try {
      const isConnected = await testDatabaseConnection();
      set({ dbConnected: isConnected });
      return isConnected;
    } catch (err) {
      set({ dbConnected: false });
      return false;
    }
  },

  initialize: async () => {
    const state = get();
    if (state.initialized || state.loading) return;

    try {
      set({ loading: true, error: null });

      if (!playerService) {
        playerService = PlayerService.getInstance();
      }

      if (!playerService) {
        throw new Error('PlayerService konnte nicht initialisiert werden');
      }

      const isConnected = await get().checkConnection();
      if (!isConnected) {
        throw new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
      }

      const players = await playerService.getPlayers();
      
      set({ 
        players, 
        initialized: true, 
        loading: false,
        error: null,
        dbConnected: true
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Spieler';
      set({ 
        error: errorMessage,
        loading: false,
        initialized: false,
        dbConnected: false
      });
      throw err;
    }
  },

  addPlayer: async (player) => {
    try {
      if (!playerService) {
        playerService = PlayerService.getInstance();
      }
      if (!playerService) {
        throw new Error('PlayerService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      const newPlayer = await playerService.createPlayer(player);
      set(state => ({ players: [...state.players, newPlayer] }));
      eventBus.emit('player:created', newPlayer);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Erstellen des Spielers';
      set({ error });
      throw err;
    }
  },

  updatePlayer: async (id, updates) => {
    try {
      if (!playerService) {
        playerService = PlayerService.getInstance();
      }
      if (!playerService) {
        throw new Error('PlayerService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      const updatedPlayer = await playerService.updatePlayer(id, updates);
      set(state => ({
        players: state.players.map(p => p.id === id ? updatedPlayer : p)
      }));
      eventBus.emit('player:updated', updatedPlayer);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Spielers';
      set({ error });
      throw err;
    }
  },

  removePlayer: async (id) => {
    try {
      if (!playerService) {
        playerService = PlayerService.getInstance();
      }
      if (!playerService) {
        throw new Error('PlayerService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      await playerService.deletePlayer(id);
      set(state => ({
        players: state.players.filter(p => p.id !== id)
      }));
      eventBus.emit('player:deleted', id);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Löschen des Spielers';
      set({ error });
      throw err;
    }
  },

  getPlayersByTeam: (teamId: string) => {
    return get().players.filter(player => {
      const activeMembership = player.teamMemberships?.find(m => 
        m.teamId === teamId && (!m.endDate || new Date(m.endDate) > new Date())
      );
      return !!activeMembership;
    });
  }
}));

// Subscribe to real-time updates
eventBus.on('player:updated', (player: Player) => {
  usePlayerStore.setState(state => ({
    players: state.players.map(p => p.id === player.id ? player : p)
  }));
});