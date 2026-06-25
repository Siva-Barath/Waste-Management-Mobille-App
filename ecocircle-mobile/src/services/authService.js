import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login user with house ID (username) and password against Flask backend
 * Returns: { house_id, username, address, ward }
 */
export async function loginUser(username, password) {
  try {
    const res = await api.post('/resident/login', { username, password });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Register new user
 * Returns: { token, user, household }
 */
export async function registerUser(userData) {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user profile
 * Returns: { user, household }
 */
export async function getUserProfile() {
  try {
    const res = await api.get('/auth/profile');
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Save token to AsyncStorage
 */
export async function saveToken(token) {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

/**
 * Get token from AsyncStorage
 */
export async function getToken() {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Remove token from AsyncStorage
 */
export async function removeToken() {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

/**
 * Verify token is valid by calling /auth/profile
 */
export async function verifyToken() {
  try {
    const res = await api.get('/auth/profile');
    return !!res.data;
  } catch (error) {
    return false;
  }
}
