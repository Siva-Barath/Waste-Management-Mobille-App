import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { stackScreenOptions, tabBarOptions } from './navigationTheme';

import ResidentDashboardScreen from '../screens/resident/DashboardScreen';
import ResidentCollectionsScreen from '../screens/resident/CollectionsScreen';
import ResidentHistoryScreen from '../screens/resident/HistoryScreen';
import ResidentStatsScreen from '../screens/resident/StatsScreen';
import ResidentIncentivesScreen from '../screens/resident/IncentivesScreen';
import ResidentNotificationsScreen from '../screens/resident/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="HistoryMain" component={ResidentHistoryScreen} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="StatsMain" component={ResidentStatsScreen} />
    </Stack.Navigator>
  );
}

function IncentivesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="IncentivesMain" component={ResidentIncentivesScreen} />
    </Stack.Navigator>
  );
}

function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="NotificationsMain" component={ResidentNotificationsScreen} />
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsStack}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="truck-delivery-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsStack}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Incentives"
        component={IncentivesStack}
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gift-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
