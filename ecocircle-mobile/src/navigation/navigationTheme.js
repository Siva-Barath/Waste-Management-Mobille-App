import { Platform, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

export const tabBarOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textTertiary,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.outline,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarIconStyle: {
    marginTop: 2,
  },
};

export const driverStackOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textInverse,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
  },
  headerShadowVisible: false,
  headerBackTitle: 'Back',
};
