import { create } from 'zustand';
import { Player, DuplicateStatus } from '../types/player';
import { PlayerService } from '../services/player.service';
import { EventBus } from '../services/events/EventBus';
import { testDatabaseConnection } from '../services/database';

interface PlayerState {
  players: Player[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  dbConnected: boolean;
  duplicateStatuses: Record<string, DuplicateStatus>;
  initialize: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  getPlayersByTeam: (teamId: string) => Player[];
  getDuplicateStatusForPlayer: (player: Partial<Player>, playerId?: string) => DuplicateStatus;
  calculateAllDuplicateStatuses: () => void;
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
  duplicateStatuses: {},

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

      // Calculate duplicate statuses after initialization
      get().calculateAllDuplicateStatuses();

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

  getDuplicateStatusForPlayer: (player, playerId) => {
    const { players } = get();
    let isDuplicate = false;
    let isPotentialDuplicate = false;
    let message: string | null = null;
    let duplicatePlayers: Player[] = [];

    // Skip checking against the player being edited
    const existingPlayers = players.filter(p => p.id !== playerId);

    for (const existingPlayer of existingPlayers) {
      // Count matching fields
      let matchCount = 0;
      let fieldsToCheck = 0;

      // Check first name
      if (player.firstName && existingPlayer.firstName) {
        fieldsToCheck++;
        if (player.firstName.toLowerCase() === existingPlayer.firstName.toLowerCase()) {
          matchCount++;
        }
      }

      // Check last name
      if (player.lastName && existingPlayer.lastName) {
        fieldsToCheck++;
        if (player.lastName.toLowerCase() === existingPlayer.lastName.toLowerCase()) {
          matchCount++;
        }
      }

      // Check date of birth
      if (player.dateOfBirth && existingPlayer.dateOfBirth) {
        fieldsToCheck++;
        if (player.dateOfBirth === existingPlayer.dateOfBirth) {
          matchCount++;
        }
      }

      // Check email
      if (player.email && existingPlayer.email) {
        fieldsToCheck++;
        if (player.email.toLowerCase() === existingPlayer.email.toLowerCase()) {
          matchCount++;
        }
      }

      // If three or more fields match, it's a duplicate
      if (matchCount >= 3 && fieldsToCheck >= 3) {
        isDuplicate = true;
        duplicatePlayers.push(existingPlayer);
        message = `Ein Spieler mit ähnlichen Daten existiert bereits: ${existingPlayer.firstName} ${existingPlayer.lastName}`;
        // Don't break here, continue to find all duplicates
      }

      // If first and last name match, and either email or date of birth is missing for both players
      if (player.firstName && 
          player.lastName && 
          player.firstName.toLowerCase() === existingPlayer.firstName.toLowerCase() && 
          player.lastName.toLowerCase() === existingPlayer.lastName.toLowerCase()) {
        
        const missingEmail = !player.email && !existingPlayer.email;
        const missingDob = !player.dateOfBirth && !existingPlayer.dateOfBirth;
        
        if (missingEmail || missingDob) {
          isPotentialDuplicate = true;
          duplicatePlayers.push(existingPlayer);
          message = `Möglicher Duplikat gefunden: ${existingPlayer.firstName} ${existingPlayer.lastName}. Bitte überprüfen Sie die Daten.`;
          // Don't break here, continue to find all duplicates
        }
      }
    }

    return { 
      isDuplicate, 
      isPotentialDuplicate, 
      message,
      duplicatePlayers
    };
  },

  calculateAllDuplicateStatuses: () => {
    const { players } = get();
    const duplicateStatuses: Record<string, DuplicateStatus> = {};

    // Check each player against all others
    for (const player of players) {
      duplicateStatuses[player.id] = get().getDuplicateStatusForPlayer(player, player.id);
    }

    set({ duplicateStatuses });
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

      // Check for duplicates
      const duplicateStatus = get().getDuplicateStatusForPlayer(player);
      if (duplicateStatus.isDuplicate) {
        throw new Error(duplicateStatus.message || 'Spieler existiert bereits');
      }

      set({ error: null });
      const newPlayer = await playerService.createPlayer(player);
      set(state => ({ players: [...state.players, newPlayer] }));
      eventBus.emit('player:created', newPlayer);
      
      // Recalculate duplicate statuses after adding a player
      get().calculateAllDuplicateStatuses();
      
      return newPlayer;
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

      // Check for duplicates
      const duplicateStatus = get().getDuplicateStatusForPlayer(updates, id);
      if (duplicateStatus.isDuplicate) {
        throw new Error(duplicateStatus.message || 'Spieler existiert bereits');
      }

      set({ error: null });
      const updatedPlayer = await playerService.updatePlayer(id, updates);
      set(state => ({
        players: state.players.map(p => p.id === id ? updatedPlayer : p)
      }));
      eventBus.emit('player:updated', updatedPlayer);
      
      // Recalculate duplicate statuses after updating a player
      get().calculateAllDuplicateStatuses();
      
      return updatedPlayer;
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
        players: state.players.filter(p => p.id !== id),
        duplicateStatuses: Object.fromEntries(
          Object.entries(state.duplicateStatuses).filter(([key]) => key !== id)
        )
      }));
      eventBus.emit('player:deleted', id);
      
      // Recalculate duplicate statuses after removing a player
      get().calculateAllDuplicateStatuses();
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
  usePlayerStore.setState(state => {
    const newState = {
      players: state.players.map(p => p.id === player.id ? player : p)
    };
    
    // Recalculate duplicate statuses
    setTimeout(() => {
      usePlayerStore.getState().calculateAllDuplicateStatuses();
    }, 0);
    
    return newState;
  });
});