import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

import {
  apiFetch,
  initCsrf,        // fetches CSRF token if not cached
  forceRefreshCsrf,   // forces a new token fetch (after login/register)
  clearCsrf           // clears cached token (after logout)
} from '../utils/api';

type User = {
  id: number;
  email: string;
  name?: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;           // overall initial loading (session restore)
  authLoading: boolean;       // login/register in progress
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);        // initial session restore
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch currently authenticated user.
  // GET /api/auth/me should allow anonymous and return 200 with user or 401/403.
  const fetchMe = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data: User = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await initCsrf(); // ensure header for POST
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'Login failed');
        throw new Error(txt || `Login failed (${res.status})`);
      }
      await forceRefreshCsrf(); // rotate CSRF after identity change
      await fetchMe();
    } catch (e: any) {
      setUser(null);
      setError(e?.message || 'Login failed');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, [fetchMe]);

  // Register
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await initCsrf();
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'Registration failed');
        throw new Error(txt || `Registration failed (${res.status})`);
      }
      await forceRefreshCsrf();
      await fetchMe();
    } catch (e: any) {
      setUser(null);
      setError(e?.message || 'Registration failed');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, [fetchMe]);

  // Logout
  const logout = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        console.warn('Logout request failed with status', res.status);
      }
    } catch (e) {
      console.warn('Logout network error', e);
    } finally {
      setUser(null);
      clearCsrf(); // clear cached token; next POST will refetch
      setAuthLoading(false);
    }
  }, []);

  // Initial bootstrap: ensure CSRF (optional) and restore session
  useEffect(() => {
    (async () => {
      try {
        await initCsrf();
        await fetchMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMe]);

  const value: AuthContextType = {
    user,
    loading,
    authLoading,
    error,
    login,
    register,
    logout,
    fetchMe,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}