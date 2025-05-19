import { create } from 'zustand';
import { TeamService } from '../services/team.service';
import { Team } from '../types/core/team';
import { testDatabaseConnection } from '../services/database';

interface AppState {
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  dbConnected: boolean;
  teams: Team[];
  initialize: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
}

let teamService: TeamService | null = null;
try {
  teamService = TeamService.getInstance();
} catch (err) {
  console.error('Failed to initialize TeamService:', err);
}

export const useStore = create<AppState>((set, get) => ({
  isLoading: false,
  error: null,
  initialized: false,
  dbConnected: false,
  teams: [],

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
    if (state.initialized || state.isLoading) return;

    try {
      set({ isLoading: true, error: null });

      if (!teamService) {
        teamService = TeamService.getInstance();
      }

      if (!teamService) {
        throw new Error('TeamService konnte nicht initialisiert werden');
      }

      const isConnected = await get().checkConnection();
      if (!isConnected) {
        throw new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
      }

      const teams = await teamService.getTeams();
      
      set({ 
        teams, 
        initialized: true, 
        isLoading: false,
        error: null,
        dbConnected: true
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Teams';
      set({ 
        error: errorMessage,
        isLoading: false,
        initialized: false,
        dbConnected: false,
        teams: [] // Ensure teams is always an array
      });
      throw err;
    }
  },

  addTeam: async (team) => {
    try {
      if (!teamService) {
        teamService = TeamService.getInstance();
      }
      if (!teamService) {
        throw new Error('TeamService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      const newTeam = await teamService.createTeam(team);
      set(state => ({ teams: [...state.teams, newTeam] }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Erstellen des Teams';
      set({ error });
      throw err;
    }
  },

  updateTeam: async (id, updates) => {
    try {
      if (!teamService) {
        teamService = TeamService.getInstance();
      }
      if (!teamService) {
        throw new Error('TeamService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      const updatedTeam = await teamService.updateTeam(id, updates);
      set(state => ({
        teams: state.teams.map(team => 
          team.id === id ? { ...team, ...updatedTeam } : team
        )
      }));
      return updatedTeam;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Teams';
      set({ error });
      throw err;
    }
  },

  removeTeam: async (id) => {
    try {
      if (!teamService) {
        teamService = TeamService.getInstance();
      }
      if (!teamService) {
        throw new Error('TeamService nicht verfügbar');
      }
      if (!get().dbConnected) {
        throw new Error('Keine Datenbankverbindung');
      }
      set({ error: null });
      await teamService.deleteTeam(id);
      set(state => ({
        teams: state.teams.filter(team => team.id !== id)
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Fehler beim Löschen des Teams';
      set({ error });
      throw err;
    }
  }
}));