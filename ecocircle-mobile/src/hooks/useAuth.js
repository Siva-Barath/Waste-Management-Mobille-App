import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth - Custom hook to access authentication context
 * 
 * Wrapper around useContext(AuthContext)
 * Provides auth state and methods in any screen/component
 */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
