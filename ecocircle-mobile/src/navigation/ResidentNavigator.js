import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stackScreenOptions } from './navigationTheme';

import ResidentDashboardScreen from '../screens/resident/DashboardScreen';
import ResidentCollectionsScreen from '../screens/resident/CollectionsScreen';
import ResidentHistoryScreen from '../screens/resident/HistoryScreen';
import ResidentReportScreen from '../screens/resident/ReportScreen';
import ResidentProfileScreen from '../screens/resident/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#2d6a4f',
  tabBarInactiveTintColor: '#9ca3af',
  tabBarStyle: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
};

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="DashboardMain" component={ResidentDashboardScreen} />
    </Stack.Navigator>
  );
}

function CollectionsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CollectionsMain" component={ResidentCollectionsScreen} />
    </Stack.Navigator>
  );
}

function ReportStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ReportMain" component={ResidentReportScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="HistoryMain" component={ResidentHistoryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProfileMain" component={ResidentProfileScreen} />
    </Stack.Navigator>
  );
}

export default function ResidentNavigator() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsStack}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'truck-delivery' : 'truck-delivery-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportStack}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'plus-circle' : 'plus-circle-outline'} color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'lightning-bolt-circle' : 'lightning-bolt-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
