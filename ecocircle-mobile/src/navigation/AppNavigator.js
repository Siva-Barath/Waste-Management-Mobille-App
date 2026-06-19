import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ResidentNavigator from './ResidentNavigator';
import DriverNavigator from './DriverNavigator';
import { colors } from '../utils/colors';
import { spacing } from '../utils/spacing';

export default function AppNavigator() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'resident') {
    return <ResidentNavigator />;
  }

  if (user.role === 'driver') {
    return <DriverNavigator />;
  }

  return (
    <View style={styles.unsupported}>
      <Text style={styles.unsupportedTitle}>Unsupported account</Text>
      <Text style={styles.unsupportedText}>
        This app supports Resident and Driver accounts only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  unsupported: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    backgroundColor: colors.background,
  },
  unsupportedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  unsupportedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
