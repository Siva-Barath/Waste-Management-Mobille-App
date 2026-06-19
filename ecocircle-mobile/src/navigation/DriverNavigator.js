import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { driverStackOptions } from './navigationTheme';
import DriverDashboardScreen from '../screens/driver/DashboardScreen';
import RouteDetailScreen from '../screens/driver/RouteDetailScreen';

const Stack = createNativeStackNavigator();

export default function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={driverStackOptions}>
      <Stack.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={{ title: 'Stop Details', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
