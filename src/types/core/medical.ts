export interface Injury {
  id: string;
  playerId: string;
  type: string;
  location: string;
  startDate: string;
  endDate?: string;
  severity: 'minor' | 'moderate' | 'severe';
  rehabilitationPlan?: string;
  notes?: string;
  status: 'active' | 'recovered' | 'recurring';
  medicalStaffId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalCheckup {
  id: string;
  playerId: string;
  date: string;
  type: 'routine' | 'injury-related' | 'pre-season';
  findings: string;
  recommendations?: string;
  nextCheckupDate?: string;
  medicalStaffId: string;
  createdAt: string;
  updatedAt: string;
}