import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <RootContent />
          </AppProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
