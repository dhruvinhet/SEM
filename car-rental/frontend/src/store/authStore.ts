import { create } from 'zustand';
import type { User } from '../types';
import { authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: sessionStorage.getItem('accessToken'),
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user: User, token: string) => {
    sessionStorage.setItem('accessToken', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  login: async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { accessToken, user } = res.data;
    sessionStorage.setItem('accessToken', accessToken);
    set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
  },

  signup: async (name: string, email: string, password: string, role: string) => {
    const res = await authAPI.signup({ name, email, password, role });
    const { accessToken, user } = res.data;
    sessionStorage.setItem('accessToken', accessToken);
    set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await authAPI.profile();
      set({ user: res.data, token, isAuthenticated: true, isLoading: false });
    } catch {
      sessionStorage.removeItem('accessToken');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
