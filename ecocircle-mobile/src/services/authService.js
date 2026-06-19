import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * authService.js - Authentication service methods
 * 
 * Higher-level auth operations wrapping API calls
 * - Separate from AuthContext for better organization
 * - Can be used in screens or hooks
 */

/**
 * Login user with phone and password
 * Returns: { token, user, household }
 */
export async function loginUser(phone, password) {
  try {
    const res = await api.post('/auth/login', { phone, password });
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
