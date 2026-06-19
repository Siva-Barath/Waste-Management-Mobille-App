import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { mobileTypography, shadows } from '../../styles/mobileTheme';

export default function EmptyState({
  icon = 'inbox-outline',
  iconColor = colors.textTertiary,
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={40} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    padding: spacing['4xl'],
    alignItems: 'center',
    ...shadows.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...mobileTypography.cardTitle,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...mobileTypography.screenSubtitle,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  actionBtn: {
    backgroundColor: colors.primary,
    minHeight: 48,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
  },
});
