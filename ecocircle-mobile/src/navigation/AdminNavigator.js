import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminCollectionsScreen from '../screens/admin/CollectionsScreen';
import AdminHouseholdsScreen from '../screens/admin/HouseholdsScreen';
import AdminDriversScreen from '../screens/admin/DriversScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * DashboardStack - Stack navigator for admin dashboard tab
 */
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#2d6a4f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminDashboardMain"
        component={AdminDashboardScreen}
        options={{ title: 'Overview', headerShown: false }}
      />
    </Stack.Navigator>
  );
}

/**
 * CollectionsStack - Stack navigator for collections management tab
 */
function CollectionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#2d6a4f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminCollectionsMain"
        component={AdminCollectionsScreen}
        options={{ title: 'Collections' }}
      />
    </Stack.Navigator>
  );
}

/**
 * HouseholdsStack - Stack navigator for household management tab
 */
function HouseholdsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#2d6a4f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminHouseholdsMain"
        component={AdminHouseholdsScreen}
        options={{ title: 'Households' }}
      />
    </Stack.Navigator>
  );
}

/**
 * DriversStack - Stack navigator for driver management tab
 */
function DriversStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#2d6a4f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AdminDriversMain"
        component={AdminDriversScreen}
        options={{ title: 'Drivers' }}
      />
    </Stack.Navigator>
  );
}

/**
 * AdminNavigator.js
 * 
 * Equivalent to web admin routes and Layout with bottom tab navigation
 * - Bottom Tab Navigator with 4 tabs for admin features
 * - Each tab has a stack navigator for nested navigation
 * - Preserves web route structure: /admin/* paths
 * - Color scheme: Green (#2d6a4f) primary color matching web
 */

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2d6a4f',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e5e5',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
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
          tabBarLabel: 'Households',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Drivers"
        component={DriversStack}
        options={{
          tabBarLabel: 'Drivers',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
