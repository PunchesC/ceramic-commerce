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
  ensureCsrf,        // fetches CSRF token if not cached
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

  /**
   * Fetch currently authenticated user.
   * GET /api/auth/me should be marked [AllowAnonymous] and return 401/403 or 200.
   */
  const fetchMe = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me', {
        credentials: 'include'
      });
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

  /**
   * Login flow:
   * 1. Ensure we have a CSRF token (login is POST and validated).
   * 2. POST credentials.
   * 3. On success force refresh CSRF token (session identity changed).
   * 4. Fetch user profile.
   */
  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await ensureCsrf(); // only fetches if missing
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        if (res.status === 400 || res.status === 401) {
          const txt = await res.text().catch(() => 'Login failed');
          throw new Error(txt || 'Login failed');
        }
        throw new Error(`Login failed (${res.status})`);
      }
      // Pair CSRF token with new auth cookie
      await forceRefreshCsrf();
      await fetchMe();
    } catch (e: any) {
      setUser(null);
      setError(e?.message || 'Login failed');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }, [fetchMe]);

  /**
   * Registration flow mirrors login.
   */
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await ensureCsrf();
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'Registration failed');
        throw new Error(txt || 'Registration failed');
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

  /**
   * Logout flow:
   * 1. POST logout (endpoint exempt from CSRF in backend).
   * 2. Clear user + cached CSRF token (cookie likely rotated or invalidated).
   * 3. (Optional) You can pre-fetch a fresh CSRF token for next login attempt.
   */
  const logout = useCallback(async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        // Even if logout fails, clear local state to avoid a stuck UI.
        console.warn('Logout request failed with status', res.status);
      }
    } catch (e) {
      console.warn('Logout network error', e);
    } finally {
      setUser(null);
      clearCsrf();
      setAuthLoading(false);
    }
  }, []);

  /**
   * Initial bootstrap:
   * Option A (current): eagerly ensure CSRF so first POST is ready.
   * Option B: remove ensureCsrf() call to defer until first mutating request.
   */
  useEffect(() => {
    (async () => {
      try {
        await ensureCsrf();
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
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}