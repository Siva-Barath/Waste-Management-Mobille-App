import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const initializeAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser && !cancelled) {
          const parsed = JSON.parse(savedUser);
          // If stored user has no role (stale session), clear and force re-login
          if (!parsed.role) {
            await AsyncStorage.removeItem('user');
            if (!cancelled) setLoading(false);
            return;
          }
          setUser(parsed);
          setHousehold({ id: parsed.house_id, ward: parsed.ward, address: parsed.address });
        }
      } catch {
        await AsyncStorage.removeItem('user');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initializeAuth();
    return () => { cancelled = true; };
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/resident/login', { username, password });
    const d = res.data;
    const userData = {
      house_id: d.house_id,
      username: d.username,
      name: d.username,
      address: d.address || '',
      ward: d.ward || '',
      role: 'resident',
    };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setHousehold({ id: d.house_id, ward: d.ward, address: d.address });
    return d;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setHousehold(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = { user, household, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
