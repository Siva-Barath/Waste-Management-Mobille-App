import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { mobileTypography, shadows } from '../../styles/mobileTheme';

export default function ScreenHeader({ title, subtitle, rightElement, eyebrow }) {
  return (
    <View style={styles.container}>
      <View style={styles.textCol}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.accentLine} />
      </View>
      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  textCol: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: mobileTypography.screenTitle,
  subtitle: {
    ...mobileTypography.screenSubtitle,
    marginTop: spacing.sm,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.lg,
  },
  right: {
    flexShrink: 0,
  },
});
