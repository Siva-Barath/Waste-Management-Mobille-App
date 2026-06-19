/**
 * helpers.js - Utility helper functions
 * 
 * Common utilities used across screens and components
 */

import { format, formatDistance, isToday, isYesterday } from 'date-fns';

/**
 * Format date for display
 */
export function formatDate(date, formatString = 'MMM dd, yyyy') {
  try {
    return format(new Date(date), formatString);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  try {
    const d = new Date(date);
    if (isToday(d)) {
      return formatDistance(d, new Date(), { addSuffix: true });
    } else if (isYesterday(d)) {
      return 'Yesterday';
    }
    return format(d, 'MMM dd');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format time for display
 */
export function formatTime(date, formatString = 'HH:mm') {
  try {
    return format(new Date(date), formatString);
  } catch {
    return 'Invalid time';
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

/**
 * Mask phone number (e.g., +XX XXX-XXX-XXXX)
 */
export function maskPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return phone;
  return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
