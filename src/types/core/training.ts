export interface TrainingSession {
  id: string;
  teamId: string;
  date: string;
  duration: number; // in minutes
  type: 'technical' | 'tactical' | 'physical' | 'recovery' | 'match-preparation';
  focus?: string[];
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingAttendance {
  id: string;
  trainingId: string;
  playerId: string;
  status: 'present' | 'absent' | 'partial' | 'excused';
  notes?: string;
  performance?: {
    intensity: number; // 1-10
    quality: number; // 1-10
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}