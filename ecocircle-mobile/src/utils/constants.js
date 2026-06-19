/**
 * constants.js - Application constants
 * 
 * Centralized constants for roles, statuses, collection types, etc.
 */

/**
 * User roles
 */
export const USER_ROLES = {
  RESIDENT: 'resident',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

export const USER_ROLE_LABELS = {
  resident: 'Resident',
  driver: 'Driver',
  admin: 'Administrator',
};

/**
 * Collection statuses
 */
export const COLLECTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
};

export const COLLECTION_STATUS_LABELS = {
  pending: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  missed: 'Missed',
};

/**
 * Waste types
 */
export const WASTE_TYPES = {
  ORGANIC: 'organic',
  PLASTIC: 'plastic',
  PAPER: 'paper',
  METAL: 'metal',
  MIXED: 'mixed',
};

export const WASTE_TYPE_LABELS = {
  organic: 'Organic',
  plastic: 'Plastic',
  paper: 'Paper',
  metal: 'Metal',
  mixed: 'Mixed',
};

/**
 * Incentive types
 */
export const INCENTIVE_TYPES = {
  POINTS: 'points',
  VOUCHER: 'voucher',
  BADGE: 'badge',
  REWARD: 'reward',
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  COLLECTION_SCHEDULED: 'collection_scheduled',
  COLLECTION_COMPLETED: 'collection_completed',
  INCENTIVE_EARNED: 'incentive_earned',
  SYSTEM_ALERT: 'system_alert',
  MESSAGE: 'message',
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  COLLECTIONS: {
    LIST: '/collections',
    DETAIL: '/collections/:id',
    CREATE: '/collections',
    UPDATE: '/collections/:id',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id',
    CLEAR: '/notifications/clear',
  },
  HOUSEHOLDS: {
    LIST: '/households',
    DETAIL: '/households/:id',
  },
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

/**
 * Notification polling interval (ms)
 */
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30 seconds

/**
 * Timeouts
 */
export const TIMEOUTS = {
  API_CALL: 10000,          // 10 seconds
  TOAST_DISPLAY: 3000,       // 3 seconds
  DEBOUNCE_INPUT: 300,       // 300ms
};
