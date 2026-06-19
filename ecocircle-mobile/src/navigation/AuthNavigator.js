import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginSelectorScreen from '../screens/auth/LoginSelectorScreen';
import ResidentLoginScreen from '../screens/auth/ResidentLoginScreen';
import DriverLoginScreen from '../screens/auth/DriverLoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

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
      <Stack.Screen name="LoginSelector" component={LoginSelectorScreen} />
      <Stack.Screen name="ResidentLogin" component={ResidentLoginScreen} />
      <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
