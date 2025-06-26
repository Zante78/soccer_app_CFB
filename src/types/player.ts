// Player interface
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  dateOfBirth?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  skills: PlayerSkill[];
  teamId?: string;
  teamName?: string; // New property to store the team name
  teamMemberships?: TeamMembership[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerSkill {
  name: string;
  value: number;
  category: string;
  weight?: number;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  role: 'player' | 'captain' | 'viceCaptain';
  startDate: string;
  endDate?: string;
}

// Define the DuplicateStatus interface
export interface DuplicateStatus {
  isDuplicate: boolean;
  isPotentialDuplicate: boolean;
  message: string | null;
  duplicatePlayers: Player[];
}

// Default skills for new players
export const defaultSkills: PlayerSkill[] = [
  // Technische Fähigkeiten
  { name: 'Ballkontrolle', value: 10, category: 'technical' },
  { name: 'Schusstechnik', value: 10, category: 'technical' },
  { name: 'Kopfballspiel', value: 10, category: 'technical' },
  { name: 'Freistöße', value: 10, category: 'technical' },
  { name: 'Eckbälle', value: 10, category: 'technical' },
  { name: 'Passspiel', value: 10, category: 'technical' },
  
  // Körperliche Fähigkeiten
  { name: 'Schnelligkeit', value: 10, category: 'physical' },
  { name: 'Ausdauer', value: 10, category: 'physical' },
  { name: 'Kraft', value: 10, category: 'physical' },
  { name: 'Beweglichkeit', value: 10, category: 'physical' },
  { name: 'Sprungkraft', value: 10, category: 'physical' },
  
  // Mentale Fähigkeiten
  { name: 'Spielintelligenz', value: 10, category: 'mental' },
  { name: 'Konzentration', value: 10, category: 'mental' },
  { name: 'Entscheidungsfindung', value: 10, category: 'mental' },
  { name: 'Mentale Stärke', value: 10, category: 'mental' },
  
  // Soziale Fähigkeiten
  { name: 'Teamfähigkeit', value: 10, category: 'social' },
  { name: 'Kommunikation', value: 10, category: 'social' },
  { name: 'Führungsqualität', value: 10, category: 'social' }
];