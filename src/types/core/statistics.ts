export interface MatchStatistics {
  id: string;
  matchId: string;
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCard: boolean;
  // Advanced statistics
  shots?: number;
  shotsOnTarget?: number;
  passes?: number;
  passAccuracy?: number;
  tackles?: number;
  interceptions?: number;
  fouls?: {
    committed: number;
    suffered: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  competition: string;
  venue: string;
  result?: {
    goalsFor: number;
    goalsAgainst: number;
  };
  type: 'league' | 'cup' | 'friendly';
  createdAt: string;
  updatedAt: string;
}