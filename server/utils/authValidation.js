function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

function validatePhone(phone) {
  const digits = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(digits);
}

function validateEmail(email) {
  const trimmed = String(email || '').trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed);
}

function validatePassword(password) {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

module.exports = {
  normalizePhone,
  validatePhone,
  validateEmail,
  validatePassword,
};
