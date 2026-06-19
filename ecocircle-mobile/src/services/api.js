import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * api.js - Axios interceptor setup
 *
 * Equivalent to web API service
 * - Base URL configuration (same backend as web)
 * - Request interceptor: Adds JWT token to headers
 * - Response interceptor: Handles errors, token refresh on 401
 */

const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * - Add JWT token from AsyncStorage to Authorization header
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handle 401 Unauthorized (token expired)
 * - Clear stored token and user
 * - Redirect to login (handled by RootNavigator watching auth state)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // RootNavigator will detect user is null and show auth stack
      } catch (err) {
        console.error('Error clearing auth:', err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
