export interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  dateOfBirth?: string;
  nationality?: string;
  height?: number; // in cm
  weight?: number; // in kg
  photoUrl?: string;
  positions: PlayerPosition[];
  teamId?: string;
  contact: ContactInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type PlayerPosition = 
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward'
  | 'centerBack'
  | 'fullBack'
  | 'defensiveMid'
  | 'attackingMid'
  | 'winger'
  | 'striker';