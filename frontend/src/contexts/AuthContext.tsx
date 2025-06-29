import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = { id: number; email: string; name?: string; isAdmin?: boolean; };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send cookies
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    // After login, fetch user info from a /me endpoint
    const userRes = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const userData = await userRes.json();
    setUser(userData);
  };

  const register = async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) throw new Error('Registration failed');
    // After register, fetch user info from a /me endpoint
    const userRes = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });
    if (!userRes.ok) throw new Error('Failed to fetch user info');
    const userData = await userRes.json();
    setUser(userData);
  };


  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}