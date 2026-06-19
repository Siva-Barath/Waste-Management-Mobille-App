import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useAsyncStorage - Custom hook for AsyncStorage operations
 * 
 * Handles reading, writing, and deleting from AsyncStorage
 * Equivalent to web localStorage hook
 * 
 * Usage:
 * const [value, setValue] = useAsyncStorage('myKey', 'defaultValue');
 */

export function useAsyncStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load value from AsyncStorage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        } else {
          setStoredValue(initialValue);
        }
      } catch (err) {
        setError(err);
        setStoredValue(initialValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Update value and save to AsyncStorage
  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      setError(err);
    }
  };

  // Remove value from AsyncStorage
  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      setError(err);
    }
  };

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
    error,
  };
}
