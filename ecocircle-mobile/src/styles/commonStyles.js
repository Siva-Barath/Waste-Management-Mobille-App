import { StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { spacing, borderRadius, layoutSpacing, componentHeight } from '../utils/spacing';
import { mobileTypography, shadows, touchTarget } from './mobileTheme';

export const commonStyles = StyleSheet.create({
  flex: { flex: 1 },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layoutSpacing.containerPadding,
  },
  screenTitle: mobileTypography.screenTitle,
  screenSubtitle: {
    ...mobileTypography.screenSubtitle,
    marginTop: spacing.sm,
  },
  sectionTitle: mobileTypography.sectionTitle,
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
  bodyTextSmall: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    minHeight: touchTarget.minHeight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonPrimaryText: {
    color: colors.surface,
    ...typography.bodySmall,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.outline,
    borderWidth: 1,
    minHeight: touchTarget.minHeight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: colors.primary,
    ...typography.bodySmall,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardTitle: mobileTypography.cardTitle,
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    minHeight: componentHeight.input,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  badge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
});
