/**
 * colors.js - Design system colors
 * 
 * Matched to web Tailwind color scheme
 * Primary: Green (#2d6a4f) - sustainable/eco theme
 * Secondary: Teal (#52796f) - accent
 * Accent: Lime (#a4c639) - highlights
 */

export const colors = {
  // Primary - Green (eco theme)
  primary: '#2d6a4f',      // green-900
  primaryLight: '#40916c', // green-700
  primaryDark: '#1b4332', // green-950
  primaryVeryLight: '#81c784', // green-500

  // Secondary - Teal
  secondary: '#52796f',    // teal
  secondaryLight: '#74a89e',
  secondaryDark: '#306b5a',

  // Accent - Lime
  accent: '#a4c639',
  accentLight: '#c5e1a5',
  accentDark: '#7cb342',

  // Semantic colors
  success: '#52b788',      // green
  error: '#d62828',        // red
  warning: '#f77f00',      // orange
  info: '#457b9d',         // blue

  // Neutral/Gray
  background: '#fafaf8',   // stone-50
  surface: '#ffffff',      // white
  surfaceVariant: '#f5f5f5',
  outline: '#e5e5e5',      // light gray
  outlineVariant: '#cccccc', // medium gray
  text: '#1c1917',         // stone-900
  textSecondary: '#78716c', // stone-500
  textTertiary: '#a8a29e',  // stone-400
  textInverse: '#ffffff',   // white for dark backgrounds

  // UI specific
  border: '#e5e5e5',
  divider: '#f0f0f0',
  disabled: '#cccccc',
  placeholder: '#999999',

  // Role-specific
  resident: '#2d6a4f',     // green
  driver: '#457b9d',       // blue
  admin: '#d62828',        // red
};

/**
 * Get color by role
 */
export function getColorByRole(role) {
  const roleColors = {
    resident: colors.resident,
    driver: colors.driver,
    admin: colors.admin,
  };
  return roleColors[role] || colors.primary;
}

/**
 * Get role badge background color
 */
export function getRoleBadgeColor(role) {
  const badges = {
    resident: { bg: '#e8f5e9', text: colors.resident },
    driver: { bg: '#e3f2fd', text: colors.driver },
    admin: { bg: '#ffebee', text: colors.admin },
  };
  return badges[role] || { bg: colors.background, text: colors.text };
}
