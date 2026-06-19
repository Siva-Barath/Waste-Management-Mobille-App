import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute.js - Protected screen component
 * 
 * Equivalent to web ProtectedRoute HOC
 * - Wraps a screen component
 * - Checks if user has required role
 * - Shows loading state while auth is being initialized
 * - Can be used for screens that need role-based access
 * 
 * Usage:
 * <ProtectedRoute roles={['resident']} navigation={navigation}>
 *   <ResidentDashboard />
 * </ProtectedRoute>
 */

export function withProtectedRoute(ScreenComponent, requiredRoles = []) {
  return function ProtectedScreen(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf8' }}>
          <ActivityIndicator size="large" color="#2d6a4f" />
        </View>
      );
    }

    if (!user) {
      // This should not happen - RootNavigator handles unauthenticated users
      // But as a safety check, we can navigate to login
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf8' }}>
          <ActivityIndicator size="large" color="#2d6a4f" />
        </View>
      );
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      // User doesn't have required role
      // In real app, navigate to unauthorized screen or home
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf8' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>Unauthorized access</Text>
        </View>
      );
    }

    return <ScreenComponent {...props} />;
  };
}

/**
 * checkUserRole - Utility to check if user has required role
 * 
 * Usage in navigation guards or conditional rendering:
 * if (checkUserRole(user, ['resident', 'admin'])) {
 *   // User has one of the required roles
 * }
 */
export function checkUserRole(user, requiredRoles = []) {
  if (!user) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(user.role);
}

/**
 * useProtectedNavigation - Hook for protected navigation
 * 
 * Usage in screen components:
 * const { canNavigate, userRole } = useProtectedNavigation(['resident', 'admin']);
 * if (!canNavigate) {
 *   return <UnauthorizedScreen />;
 * }
 */
export function useProtectedNavigation(requiredRoles = []) {
  const { user } = useAuth();

  return {
    canNavigate: checkUserRole(user, requiredRoles),
    userRole: user?.role,
    user,
  };
}