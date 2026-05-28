'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // FIX: Start loading as false — the localStorage restore is synchronous-ish
  // and we don't want to block the login button on page load
  const [loading, setLoading] = useState(false);
  const [authRestored, setAuthRestored] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Restore auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('haqms_token');
      const storedUser = localStorage.getItem('haqms_user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error('Failed to restore auth state:', e);
      localStorage.removeItem('haqms_token');
      localStorage.removeItem('haqms_user');
    } finally {
      setAuthRestored(true);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch (networkErr) {
        // FIX: Provide a clear message when the backend is unreachable
        throw new Error('Cannot reach the server. Please make sure the backend is running on port 5000.');
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Unexpected server response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // FIX: Guard against unexpected response shape
      if (!data.data || !data.data.token || !data.data.user) {
        throw new Error('Invalid response from server. Please try again.');
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('haqms_token', receivedToken);
      localStorage.setItem('haqms_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (name, email, password, role = 'RECEPTIONIST') => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        });
      } catch {
        throw new Error('Cannot reach the server. Please make sure the backend is running.');
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Unexpected server response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return login(email, password);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('haqms_token');
    localStorage.removeItem('haqms_user');
    setToken(null);
    setUser(null);
    setError(null);
    router.push('/login');
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authRestored,
        error,
        login,
        register,
        logout,
        clearError,
        API_BASE_URL,
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
