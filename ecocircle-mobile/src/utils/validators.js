/**
 * Form validation utilities for auth flows
 */

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

export function validatePhone(phone) {
  const digits = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(digits);
}

export function getPhoneError(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return 'Phone number is required.';
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits.';
  if (!/^[6-9]/.test(digits)) return 'Phone number must start with 6, 7, 8, or 9.';
  return null;
}

export function validateEmail(email) {
  const trimmed = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailRegex.test(trimmed);
}

export function getEmailError(email) {
  const trimmed = String(email || '').trim();
  if (!trimmed) return 'Email is required.';
  if (!trimmed.includes('@')) return 'Email must contain @ (e.g. name@gmail.com).';
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'Enter a valid email (e.g. name@gmail.com).';
  }
  if (!parts[1].includes('.')) {
    return 'Email domain must include a dot (e.g. gmail.com).';
  }
  if (!validateEmail(trimmed)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function getPasswordError(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one digit.';
  return null;
}

export function validateNotEmpty(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

export function getNameError(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function getAddressError(address) {
  const trimmed = String(address || '').trim();
  if (!trimmed) return 'Address is required.';
  if (trimmed.length < 5) return 'Please enter a complete address.';
  return null;
}

export function validateRegisterStep1({ name, phone, email, password }) {
  return (
    getNameError(name) ||
    getPhoneError(phone) ||
    getEmailError(email) ||
    getPasswordError(password) ||
    null
  );
}

export function validateRegisterStep2({ address, ward, numResidents }) {
  const addressErr = getAddressError(address);
  if (addressErr) return addressErr;
  if (!ward) return 'Please select a ward.';
  const n = Number(numResidents);
  if (!n || n < 1 || n > 20) return 'Residents must be between 1 and 20.';
  return null;
}

export function validateLogin({ phone, password }) {
  return getPhoneError(phone) || (password ? null : 'Password is required.');
}

export function getAuthErrorMessage(err) {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }
  if (err?.code === 'ECONNABORTED') {
    return 'Request timed out. Check your internet connection.';
  }
  if (!err?.response) {
    return 'Cannot reach the server. Start the backend (npm start in server/) and ensure your phone is on the same Wi‑Fi.';
  }
  return 'Something went wrong. Please try again.';
}
