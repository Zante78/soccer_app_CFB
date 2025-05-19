import React, { createContext, useContext } from 'react';
import { User } from '../../types/core/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: 'mock-user-id',
  email: 'dev@example.com',
  role: 'admin'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always return mock user for development
  return (
    <AuthContext.Provider value={{ user: mockUser, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}