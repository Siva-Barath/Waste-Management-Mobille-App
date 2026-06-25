import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../utils/apiConfig';

const api = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

if (__DEV__) {
  console.log('[API] Base URL:', getApiBaseUrl());
}

api.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();
    try {
      const saved = await AsyncStorage.getItem('user');
      if (saved) {
        const user = JSON.parse(saved);
        if (user?.username) config.headers['X-Resident-Username'] = user.username;
      }
    } catch { /* ignore */ }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
