import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator.js
 * 
 * Equivalent to web routing logic in App.jsx
 * - Conditional rendering: if authenticated, show AppNavigator, else show AuthNavigator
 * - Handles loading state from AuthContext
 * - Preserves all auth checks and redirects
 */

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafaf8' }}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {user ? (
        <Stack.Screen
          name="AppStack"
          component={AppNavigator}
          options={{ animationEnabled: false }}
        />
      ) : (
        <Stack.Screen
          name="AuthStack"
          component={AuthNavigator}
          options={{ animationEnabled: false }}
        />
      )}
    </Stack.Navigator>
  );
}
