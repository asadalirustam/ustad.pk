import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ustaad_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user data on initial mount or token change
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setProviderProfile(res.data.provider || null);
        }
      } catch (err) {
        console.error('Failed to authenticate stored token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('ustaad_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProviderProfile(res.data.provider || null);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('ustaad_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProviderProfile(res.data.provider || null);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('ustaad_token');
    setToken(null);
    setUser(null);
    setProviderProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProviderProfile(res.data.provider || null);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  // Quick 1-click login helper for seamless testing of all 3 roles
  const quickDemoLogin = async (role) => {
    let credentials = { email: '', password: '' };
    if (role === 'customer') {
      credentials = { email: 'customer@ustaad.pk', password: 'customer123' };
    } else if (role === 'provider') {
      credentials = { email: 'rashid.electric@ustaad.pk', password: 'provider123' };
    } else if (role === 'admin') {
      credentials = { email: 'admin@ustaad.pk', password: 'admin123' };
    }
    return await login(credentials.email, credentials.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        token,
        loading,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isProvider: user?.role === 'provider',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
