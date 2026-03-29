import { create } from 'zustand';
import { api } from '@shared/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
}

const STAFF_ROLES = ['admin', 'order_manager', 'content_manager'];

function deriveFlags(roles: string[]) {
  return {
    isAdmin: roles.includes('admin'),
    isStaff: roles.some(r => STAFF_ROLES.includes(r)),
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;

  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; password_confirmation: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,

  login: async (email, password, remember = false) => {
    const { data } = await api.post('/auth/login', { email, password, remember });
    const roles: string[] = data.user.roles ?? [];
    set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false, ...deriveFlags(roles) });
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const roles: string[] = data.user.roles ?? [];
    set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false, ...deriveFlags(roles) });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isStaff: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/user');
      const user = data.user;
      const roles: string[] = user.roles ?? [];
      set({ user, isAuthenticated: true, ...deriveFlags(roles), isLoading: false });
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isStaff: false, isLoading: false });
    }
  },

  clear: () => {
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isStaff: false });
  },
}));
