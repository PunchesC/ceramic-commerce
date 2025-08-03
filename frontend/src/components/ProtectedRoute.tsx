import React, { JSX, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }: { children: ReactNode }): JSX.Element | null => {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

export const AuthRoute = ({ children }: { children: ReactNode }): JSX.Element | null => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};