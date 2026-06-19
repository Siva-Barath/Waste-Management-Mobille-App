import React from 'react';
import { useAuth } from '../context/AuthContext';
import ResidentNavigator from './ResidentNavigator';
import DriverNavigator from './DriverNavigator';
import AdminNavigator from './AdminNavigator';

/**
 * AppNavigator.js
 * 
 * Equivalent to web getDashboard() logic and role-based route rendering
 * - Conditionally renders appropriate navigator based on user.role
 * - Preserves role-based access control from web version
 * - Resident role → ResidentNavigator (6 bottom tabs)
 * - Driver role → DriverNavigator (simple stack)
 * - Admin role → AdminNavigator (4 bottom tabs)
 */

export default function AppNavigator() {
  const { user } = useAuth();

  if (!user) {
    return null; // RootNavigator should handle this, but safety check
  }

  if (user.role === 'resident') {
    return <ResidentNavigator />;
  }

  if (user.role === 'driver') {
    return <DriverNavigator />;
  }

  if (user.role === 'admin') {
    return <AdminNavigator />;
  }

  // Fallback - should never reach here
  return null;
}
