export interface Team {
  id: string;
  name: string;
  category: string;
  season: string;
  photo_url?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  venue?: string;
  trainingTime?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  playerId: string;
  role: 'player' | 'captain' | 'viceCaptain';
  startDate: string;
  endDate?: string;
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    position?: string;
    photo_url?: string;
  };
  createdAt: string;
  updatedAt: string;
}