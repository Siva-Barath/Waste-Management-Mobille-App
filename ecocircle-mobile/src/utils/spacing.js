/**
 * spacing.js - Design system spacing scale
 * 
 * Matched to Tailwind spacing (4px base unit)
 * Used for padding, margin, sizing, positioning
 */

export const spacing = {
  xs: 2,      // 2px
  sm: 4,      // 4px
  md: 8,      // 8px
  lg: 12,     // 12px
  xl: 16,     // 16px
  '2xl': 20,  // 20px
  '3xl': 24,  // 24px
  '4xl': 32,  // 32px
  '5xl': 40,  // 40px
  '6xl': 48,  // 48px
};

/**
 * Common padding/margin combinations
 */
export const layoutSpacing = {
  containerPadding: spacing['3xl'],     // 24px (standard screen padding)
  sectionMargin: spacing['2xl'],        // 20px (between sections)
  componentGap: spacing.lg,             // 12px (between items)
  itemMargin: spacing.md,               // 8px (between list items)
};

/**
 * Border radius scale
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

/**
 * Icon sizes
 */
export const iconSize = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

/**
 * Component heights
 */
export const componentHeight = {
  input: 48,
  button: 48,
  tabBar: 56,
  header: 56,
};
