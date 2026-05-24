import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';
import apiClient from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  login: (credentials: { cpf: string; password?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('vigiasaude_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: { cpf: string; password?: string }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
      
      const { user: userData, token } = response.data;
      
      setUser(userData);
      localStorage.setItem('vigiasaude_user', JSON.stringify(userData));
      localStorage.setItem('vigiasaude_token', token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vigiasaude_user');
    localStorage.removeItem('vigiasaude_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
