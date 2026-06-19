import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolve API base URL for dev and production.
 * In Expo Go on a physical device, uses the same LAN host as Metro.
 */
export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const configured = Constants.expoConfig?.extra?.apiUrl;
  if (configured && typeof configured === 'string') {
    return configured.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost') {
      return `http://${host}:5000/api`;
    }
  }

  const legacyHost =
    Constants.expoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (legacyHost) {
    const host = String(legacyHost).split(':')[0];
    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
}
