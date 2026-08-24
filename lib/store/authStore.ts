'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Also store in localStorage for axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      isAdmin: () => {
        let u = get().user;
        if (!u && typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('user');
            if (raw) u = JSON.parse(raw);
          } catch {}
        }
        return ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'COUNTER_MANAGER', 'COUNTER_AGENT'].includes(
          u?.role || ''
        );
      },

      isStaff: () => {
        let u = get().user;
        if (!u && typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('user');
            if (raw) u = JSON.parse(raw);
          } catch {}
        }
        return ['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(u?.role || '');
      },
    }),
    {
      name: 'gallery-express-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
