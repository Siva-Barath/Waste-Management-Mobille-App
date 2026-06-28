import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../utils/apiConfig';

const api = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const baseURL = getApiBaseUrl(); // e.g. http://192.168.1.x:5000/api
    config.baseURL = baseURL;

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch { /* ignore */ }

    if (__DEV__) {
      console.log(`[API REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API RES] ${response.status} ${response.config?.url}`, JSON.stringify(response.data));
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.warn(
        `[API ERR] ${error?.response?.status} ${error?.config?.url}`,
        error?.response?.data
      );
    }
    return Promise.reject(error);
  }
);

export default api;
