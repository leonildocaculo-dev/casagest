'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getCsrfCookie } from '@/lib/api';

export type UserRole = 'admin' | 'proprietario' | 'cliente';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  email_verified_at: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  favoriteIds: number[];
  toggleFavorite: (imovelId: number) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; role: UserRole; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const response = await api.get('/me');
        if (isMounted) {
          setUser(response.data.user);
          setFavoriteIds(response.data.favorite_imovel_ids || []);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setFavoriteIds([]);
          localStorage.removeItem('casagest_token');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = async (imovelId: number): Promise<boolean> => {
    if (!user || user.role !== 'cliente') return false;
    try {
      const response = await api.post(`/imoveis/${imovelId}/favorito`);
      const { is_favorito } = response.data;
      setFavoriteIds((prev) => 
        is_favorito ? [...prev, imovelId] : prev.filter((id) => id !== imovelId)
      );
      return is_favorito;
    } catch (err) {
      console.error('Erro ao alternar favorito', err);
      return favoriteIds.includes(imovelId);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await getCsrfCookie();
    } catch (err) {
      console.warn('CSRF cookie fetch warning:', err);
    }
    const response = await api.post('/login', { email, password });
    const { user, token, favorite_imovel_ids } = response.data;
    if (token) {
      localStorage.setItem('casagest_token', token);
    }
    setUser(user);
    setFavoriteIds(favorite_imovel_ids || []);
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; role: UserRole; phone?: string }) => {
    try {
      await getCsrfCookie();
    } catch (err) {
      console.warn('CSRF cookie fetch warning:', err);
    }
    const response = await api.post('/register', data);
    const { user, token, favorite_imovel_ids } = response.data;
    if (token) {
      localStorage.setItem('casagest_token', token);
    }
    setUser(user);
    setFavoriteIds(favorite_imovel_ids || []);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('casagest_token');
      setUser(null);
      setFavoriteIds([]);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data.user);
    } catch (err) {
      console.error('Error refreshing user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, favoriteIds, toggleFavorite, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
