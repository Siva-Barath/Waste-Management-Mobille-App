import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverDashboardScreen from '../screens/driver/DashboardScreen';
import RouteDetailScreen from '../screens/driver/RouteDetailScreen';

const Stack = createNativeStackNavigator();

/**
 * DriverNavigator.js
 * 
 * Equivalent to web driver routes (/driver)
 * - Simple stack navigator (no tabs needed)
 * - Supports navigation from Dashboard → RouteDetail
 * - Preserves web route structure
 * - Color scheme: Green (#2d6a4f) matching web
 */

export default function DriverNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2d6a4f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{
          title: 'Routes',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={{
          title: 'Route Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
