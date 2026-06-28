import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const initializeAuth = async () => {
      try {
        const [savedUser, savedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);
        if (savedUser && savedToken && !cancelled) {
          const parsed = JSON.parse(savedUser);
          // Require house_id and role — clears any stale pre-Flask sessions
          if (!parsed.house_id || !parsed.role) {
            await AsyncStorage.multiRemove(['user', 'token']);
            if (!cancelled) setLoading(false);
            return;
          }
          setUser(parsed);
        }
      } catch {
        await AsyncStorage.multiRemove(['user', 'token']);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initializeAuth();
    return () => { cancelled = true; };
  }, []);

  // House ID + password login → Flask /api/resident/login
  // Returns: { success, house_id, username, address, ward, lat, lng, phone_number, ... }
  const login = async (houseId, password) => {
    const res = await api.post('/resident/login', { username: houseId, password });

    if (__DEV__) {
      console.log('[AUTH] endpoint: /resident/login');
      console.log('[AUTH] request body:', JSON.stringify({ username: houseId, password }));
      console.log('[AUTH] response status:', res.status);
      console.log('[AUTH] response body:', JSON.stringify(res.data));
    }

    const d = res.data;
    if (!d.success) {
      throw { response: { data: { error: d.message || 'Login failed.' } } };
    }

    const userData = {
      // Flask returns no JWT — store house_id as the identity token
      id:       d.house_id,
      username: d.username,
      name:     d.username,
      house_id: d.house_id,
      address:  d.address  || '',
      ward:     d.ward     || '',
      lat:      d.lat      || 0,
      lng:      d.lng      || 0,
      phone:    d.phone_number || '',
      zone:     d.zone     || '',
      role:     'resident',
    };

    if (__DEV__) {
      console.log('[AUTH] storing userData:', JSON.stringify(userData));
    }

    // Flask auth has no JWT — use house_id as a session marker so
    // RootNavigator knows the user is authenticated
    await AsyncStorage.setItem('token', d.house_id);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
