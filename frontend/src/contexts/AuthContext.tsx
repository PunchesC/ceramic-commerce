import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiFetch, initCsrf } from "../utils/api";

type User = { id: number; email: string; name?: string; isAdmin?: boolean };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user info
  const fetchMe = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    // Refresh CSRF after auth, tokens are often tied to session/identity
    await initCsrf();
    await fetchMe();
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await apiFetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) throw new Error("Registration failed");
    // Refresh CSRF after auth
    await initCsrf();
    await fetchMe();
  };

  const logout = async () => {
    await apiFetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  // Initialize CSRF early and try to restore session on mount
  useEffect(() => {
    initCsrf().finally(fetchMe);
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}