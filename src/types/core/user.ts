export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  teams?: string[]; // teamIds
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'admin'
  | 'headCoach'
  | 'assistantCoach'
  | 'medicalStaff'
  | 'analyst'
  | 'scout';

export type Permission =
  | 'manage:players'
  | 'view:players'
  | 'manage:teams'
  | 'view:teams'
  | 'manage:evaluations'
  | 'view:evaluations'
  | 'manage:medical'
  | 'view:medical'
  | 'manage:users'
  | 'export:data';