import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * storageService.js - AsyncStorage wrapper
 * 
 * Equivalent to web localStorage operations
 * - JSON serialization/deserialization
 * - Error handling
 * - Common storage keys centralized
 */

// Storage keys constants
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  HOUSEHOLD: 'household',
  APP_STATE: 'app_state',
  USER_PREFERENCES: 'user_preferences',
};

/**
 * Save JSON data to AsyncStorage
 */
export async function saveData(key, data) {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get JSON data from AsyncStorage
 */
export async function getData(key) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Save user object
 */
export async function saveUser(user) {
  return saveData(STORAGE_KEYS.USER, user);
}

/**
 * Get user object
 */
export async function getUser() {
  return getData(STORAGE_KEYS.USER);
}

/**
 * Save token string
 */
export async function saveToken(token) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

/**
 * Get token string
 */
export async function getToken() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Save household object
 */
export async function saveHousehold(household) {
  return saveData(STORAGE_KEYS.HOUSEHOLD, household);
}

/**
 * Get household object
 */
export async function getHousehold() {
  return getData(STORAGE_KEYS.HOUSEHOLD);
}

/**
 * Remove single key from storage
 */
export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key ${key}:`, error);
    throw error;
  }
}

/**
 * Clear all auth-related data
 */
export async function clearAuthData() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.HOUSEHOLD,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
}

/**
 * Clear all storage
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all storage:', error);
    throw error;
  }
}

/**
 * Get all keys in storage
 */
export async function getAllKeys() {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
}
