export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

export function validatePassword(password, { min = 8 } = {}) {
  const errors = [];
  if (!password || password.length < min) errors.push(`Password must be at least ${min} characters.`);
  return errors;
}
