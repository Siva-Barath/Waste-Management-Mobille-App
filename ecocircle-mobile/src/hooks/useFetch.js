import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * useFetch - Custom hook for API data fetching
 * 
 * Handles loading state, error state, and data fetching
 * Equivalent to web data fetching patterns
 * 
 * Usage:
 * const { data, loading, error, refetch } = useFetch('/api/collections');
 */

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
