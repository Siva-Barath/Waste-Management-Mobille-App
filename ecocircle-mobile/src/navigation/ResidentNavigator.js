import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import ResidentDashboardScreen from '../screens/resident/DashboardScreen';
import ResidentCollectionsScreen from '../screens/resident/CollectionsScreen';
import ResidentHistoryScreen from '../screens/resident/HistoryScreen';
import ResidentStatsScreen from '../screens/resident/StatsScreen';
import ResidentIncentivesScreen from '../screens/resident/IncentivesScreen';
import ResidentNotificationsScreen from '../screens/resident/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * DashboardStack - Stack navigator for dashboard tab
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
        name="DashboardMain"
        component={ResidentDashboardScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
    </Stack.Navigator>
  );
}

/**
 * CollectionsStack - Stack navigator for collections tab
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
        name="CollectionsMain"
        component={ResidentCollectionsScreen}
        options={{ title: 'Collections' }}
      />
    </Stack.Navigator>
  );
}

/**
 * HistoryStack - Stack navigator for history tab
 */
function HistoryStack() {
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
        name="HistoryMain"
        component={ResidentHistoryScreen}
        options={{ title: 'History' }}
      />
    </Stack.Navigator>
  );
}

/**
 * StatsStack - Stack navigator for stats tab
 */
function StatsStack() {
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
        name="StatsMain"
        component={ResidentStatsScreen}
        options={{ title: 'Statistics' }}
      />
    </Stack.Navigator>
  );
}

/**
 * IncentivesStack - Stack navigator for incentives tab
 */
function IncentivesStack() {
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
        name="IncentivesMain"
        component={ResidentIncentivesScreen}
        options={{ title: 'Incentives' }}
      />
    </Stack.Navigator>
  );
}

/**
 * NotificationsStack - Stack navigator for notifications tab
 */
function NotificationsStack() {
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
        name="NotificationsMain"
        component={ResidentNotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

/**
 * ResidentNavigator.js
 * 
 * Equivalent to web resident routes and Layout with bottom tab navigation
 * - Bottom Tab Navigator with 6 tabs for resident features
 * - Each tab has a stack navigator for nested navigation
 * - Preserves web route structure: /resident/* paths
 * - Color scheme: Green (#2d6a4f) primary color matching web
 */

export default function ResidentNavigator() {
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
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trash-can-outline" color={color} size={size} />
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
          tabBarLabel: 'Incentives',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gift" color={color} size={size} />
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
