import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginSelectorScreen from '../screens/auth/LoginSelectorScreen';
import ResidentLoginScreen from '../screens/auth/ResidentLoginScreen';
import DriverLoginScreen from '../screens/auth/DriverLoginScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

/**
 * AuthNavigator.js
 * 
 * Equivalent to web auth routes (Landing, /login/*, /register)
 * - Stack navigator for unauthenticated users
 * - Routes: Landing → LoginSelector → Role-specific Login → Register
 * - Preserves all navigation logic from web version
 */

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
      initialRouteName="Landing"
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ animationEnabled: false }}
      />
      <Stack.Screen
        name="LoginSelector"
        component={LoginSelectorScreen}
        options={{
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="ResidentLogin"
        component={ResidentLoginScreen}
        options={{
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="DriverLogin"
        component={DriverLoginScreen}
        options={{
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animationEnabled: true,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
