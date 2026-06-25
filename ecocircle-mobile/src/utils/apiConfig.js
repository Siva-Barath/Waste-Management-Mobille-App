import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 5000;

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

function hostFromUri(uri) {
  if (!uri) return null;
  const match = String(uri).match(/^(?:exp|http|https):\/\/([^/:]+)/i);
  const host = match?.[1];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  return host;
}

function hostFromDebuggerHost(debuggerHost) {
  if (!debuggerHost) return null;
  const host = String(debuggerHost).split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  return host;
}

function buildLanApiUrl(host) {
  return `http://${host}:${API_PORT}/api`;
}

/**
 * Resolve API base URL for dev and production.
 * In Expo Go on a physical device, uses the same LAN host as Metro.
 */
export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return stripTrailingSlash(process.env.EXPO_PUBLIC_API_URL);
  }

  const configured = Constants.expoConfig?.extra?.apiUrl;
  if (configured && typeof configured === 'string') {
    return stripTrailingSlash(configured);
  }

  const hostCandidates = [
    hostFromUri(Constants.expoConfig?.hostUri),
    hostFromUri(Constants.linkingUri),
    hostFromUri(Constants.experienceUrl),
    hostFromDebuggerHost(Constants.expoGoConfig?.debuggerHost),
    hostFromDebuggerHost(Constants.expoConfig?.debuggerHost),
    hostFromDebuggerHost(Constants.manifest2?.extra?.expoGo?.debuggerHost),
    hostFromDebuggerHost(Constants.manifest?.debuggerHost),
  ];

  for (const host of hostCandidates) {
    if (host) {
      return buildLanApiUrl(host);
    }
  }

  if (Platform.OS === 'android') {
    return buildLanApiUrl('10.0.2.2');
  }

  return buildLanApiUrl('localhost');
}
