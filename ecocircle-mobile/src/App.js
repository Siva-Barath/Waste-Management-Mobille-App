import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import RootNavigator from './navigation/RootNavigator';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * App.js - Root component
 * 
 * Equivalent to web App.jsx
 * - Wraps entire app in AuthProvider
 * - Renders RootNavigator with conditional auth/app stacks
 * - Handles error boundaries
 * - Compatible with Expo
 */

function RootContent() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <RootContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
