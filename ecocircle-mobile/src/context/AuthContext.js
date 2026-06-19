import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { normalizePhone } from '../utils/validators';

export const AuthContext = createContext(null);

/**
 * Utility: Get initial user from AsyncStorage
 * Equivalent to web localStorage.getItem('user')
 */
async function getInitialUser() {
  try {
    const saved = await AsyncStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * AuthProvider - Global authentication context provider
 * 
 * Equivalent to web AuthContext
 * - Manages user state, household data, loading state
 * - Provides login, register, logout, and profile refresh methods
 * - Persists data to AsyncStorage (instead of localStorage)
 * - Auto-refreshes profile on app launch if token exists
 * - Preserves all authentication logic from web version
 */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth on app launch
   * - Check for existing token in AsyncStorage
   * - If token exists, fetch and restore user profile
   * - If token invalid/expired, clear storage and set user to null
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');

        if (token && savedUser) {
          try {
            // Verify token by fetching profile
            const res = await api.get('/auth/profile');
            setUser(res.data.user);
            setHousehold(res.data.household);
            // Update stored user with fresh data
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
          } catch (error) {
            // Token invalid/expired - clear storage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            setHousehold(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with phone and password
   * Equivalent to web login method
   */
  const login = async (phone, password) => {
    const res = await api.post('/auth/login', {
      phone: normalizePhone(phone),
      password,
    });
    const userData = res.data.user;

    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    setHousehold(res.data.household);

    return res.data;
  };

  const register = async (data) => {
    const payload = {
      ...data,
      phone: normalizePhone(data.phone),
      email: String(data.email || '').trim().toLowerCase(),
      name: String(data.name || '').trim(),
    };
    const res = await api.post('/auth/register', payload);

    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

    setUser(res.data.user);
    setHousehold(res.data.household);

    return res.data;
  };

  /**
   * Logout user
   * - Clear AsyncStorage
   * - Reset state
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setHousehold(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Refresh user profile from API
   * Additional utility method for profile updates
   */
  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
      setHousehold(res.data.household);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    household,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook - Access auth context anywhere
 * Equivalent to web useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
