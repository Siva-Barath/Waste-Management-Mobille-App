import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stackScreenOptions, tabBarOptions } from './navigationTheme';

import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminCollectionsScreen from '../screens/admin/CollectionsScreen';
import AdminHouseholdsScreen from '../screens/admin/HouseholdsScreen';
import AdminDriversScreen from '../screens/admin/DriversScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

function CollectionsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminCollectionsMain" component={AdminCollectionsScreen} />
    </Stack.Navigator>
  );
}

function HouseholdsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminHouseholdsMain" component={AdminHouseholdsScreen} />
    </Stack.Navigator>
  );
}

function DriversStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminDriversMain" component={AdminDriversScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsStack}
        options={{
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="truck-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Households"
        component={HouseholdsStack}
        options={{
          tabBarLabel: 'Homes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Drivers"
        component={DriversStack}
        options={{
          tabBarLabel: 'Drivers',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
