/**
 * validators.js - Form validation utilities
 * 
 * Reusable validation functions for forms
 */

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic)
 */
export function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone?.replace(/\D/g, ''));
}

/**
 * Validate password strength
 * - At least 6 characters
 * - Mix of uppercase and lowercase
 * - At least one number
 */
export function validatePassword(password) {
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate password match
 */
export function validatePasswordMatch(password1, password2) {
  return password1 === password2;
}

/**
 * Validate not empty
 */
export function validateNotEmpty(value) {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
}

/**
 * Validate minimum length
 */
export function validateMinLength(value, minLength) {
  return value?.length >= minLength;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value, maxLength) {
  return value?.length <= maxLength;
}

/**
 * Validate number
 */
export function validateNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate URL format
 */
export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get validation error message
 */
export function getValidationError(field, rule, params = {}) {
  const messages = {
    required: `${field} is required`,
    email: `${field} must be a valid email`,
    phone: `${field} must be a valid phone number`,
    password: `${field} must contain uppercase, lowercase, and numbers`,
    passwordMatch: `Passwords do not match`,
    minLength: `${field} must be at least ${params.min} characters`,
    maxLength: `${field} must not exceed ${params.max} characters`,
    number: `${field} must be a number`,
    url: `${field} must be a valid URL`,
  };
  return messages[rule] || 'Invalid input';
}
