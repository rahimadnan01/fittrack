import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fittrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(localStorage.getItem('fittrack_unit') || 'kg'); // 'kg' or 'lbs'

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem('fittrack_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('fittrack_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async userData => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('fittrack_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async data => {
    const response = await api.patch('/profile', data);
    setUser(response.data.user);
    return response.data;
  };

  const toggleUnit = () => {
    const nextUnit = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(nextUnit);
    localStorage.setItem('fittrack_unit', nextUnit);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unit,
        login,
        register,
        logout,
        updateProfile,
        toggleUnit,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
