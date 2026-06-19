import { Platform } from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { spacing, borderRadius, layoutSpacing, componentHeight, iconSize } from '../utils/spacing';

export { colors, typography, spacing, borderRadius, layoutSpacing, componentHeight, iconSize };

export const mobileTypography = {
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.text,
  },
  screenSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.text,
  },
  body: typography.body,
  bodySmall: typography.bodySmall,
  label: typography.label,
  caption: typography.caption,
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
};

export const touchTarget = {
  minHeight: 48,
  minWidth: 48,
};

export const screenPadding = {
  horizontal: spacing.xl,
  vertical: spacing.xl,
  bottom: spacing['4xl'],
};
