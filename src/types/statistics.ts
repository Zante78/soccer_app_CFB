export interface GameStatistics {
  id: string;
  playerId: string;
  date: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  playerId: string;
  content: string;
  category: 'general' | 'performance' | 'medical' | 'tactical';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerHistory {
  id: string;
  playerId: string;
  date: string;
  skills: {
    name: string;
    value: number;
    category: string;
  }[];
  createdAt: string;
}