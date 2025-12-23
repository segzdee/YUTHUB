import crypto from 'crypto';

const commonPasswords = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567', 'letmein',
  'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
  'passw0rd', 'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael', 'football',
  'password1', 'password123', 'admin', 'welcome', 'login', 'hello', 'test', 'demo'
]);

export function validatePasswordStrength(password) {
  const errors = [];
  const warnings = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      warnings: [],
      strength: 'none'
    };
  }

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (commonPasswords.has(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  const repeatingChars = /(.)\1{2,}/.test(password);
  if (repeatingChars) {
    warnings.push('Password contains repeating characters');
  }

  const sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (sequential) {
    warnings.push('Password contains sequential characters');
  }

  let strength = 'weak';
  let strengthScore = 0;

  if (password.length >= 12) strengthScore++;
  if (password.length >= 16) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/\d/.test(password)) strengthScore++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;
  if (password.length >= 20) strengthScore++;

  if (strengthScore >= 7) strength = 'very strong';
  else if (strengthScore >= 5) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    score: strengthScore
  };
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
