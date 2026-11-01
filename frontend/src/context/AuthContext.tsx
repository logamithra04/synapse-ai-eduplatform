import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLoginAsStudent: () => Promise<void>;
  quickLoginAsAdmin: () => Promise<void>;
  quickLoginAsMentor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('synapse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const data = await apiRequest<any>('/auth/me');
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        streak_days: data.streak_days,
        avatar_url: data.avatar_url,
        bio: data.bio,
        target_role: data.profile?.target_role,
        current_level: data.profile?.current_level,
        diagnostic_completed: data.profile?.diagnostic_completed,
      });
    } catch {
      localStorage.removeItem('synapse_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await apiRequest<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    localStorage.setItem('synapse_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, pass: string, name: string, target_role?: string) => {
    const data = await apiRequest<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: pass,
        full_name: name,
        target_role: target_role || 'Data Scientist',
      }),
    });
    localStorage.setItem('synapse_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const quickLoginAsStudent = async () => {
    await login('alex.miller@student.edu', 'StudentPass123!');
  };

  const quickLoginAsAdmin = async () => {
    await login('admin@synapse.edu', 'AdminPass123!');
  };

  const quickLoginAsMentor = async () => {
    await login('mentor@synapse.edu', 'MentorPass123!');
  };

  const logout = () => {
    localStorage.removeItem('synapse_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        quickLoginAsStudent,
        quickLoginAsAdmin,
        quickLoginAsMentor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
