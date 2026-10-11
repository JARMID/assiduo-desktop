import { checkPwnedPassword } from './pwnedChecker';

/**
 * Strict Institutional Password Policy Enforcement for INSFP
 * Minimum 10 characters, upper, lower, digit, symbol, non-trivial sequences, HaveIBeenPwned check.
 */

export interface PasswordPolicyResult {
  valid: boolean;
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isNotTrivial: boolean;
  isPwned?: boolean;
  score: number; // 0 to 100
  reason?: string;
}

export const evaluatePasswordPolicy = (password: string): PasswordPolicyResult => {
  if (!password) {
    return {
      valid: false,
      isLengthValid: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      isNotTrivial: false,
      score: 0,
      reason: 'Le mot de passe est requis',
    };
  }

  const isLengthValid = password.length >= 10;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const trivialPatterns = [
    '1234567890',
    'abcdefghij',
    'password123',
    'insfp2026',
    'qwertyuiop',
    'admin12345',
  ];

  const lower = password.toLowerCase();
  const isNotTrivial =
    !trivialPatterns.some((pattern) => lower.includes(pattern)) &&
    !/^(\w)\1{4,}$/.test(password);

  let criteriaCount = 0;
  if (isLengthValid) criteriaCount += 25;
  if (hasUpperCase) criteriaCount += 15;
  if (hasLowerCase) criteriaCount += 15;
  if (hasNumber) criteriaCount += 20;
  if (hasSpecialChar) criteriaCount += 15;
  if (isNotTrivial) criteriaCount += 10;

  const valid =
    isLengthValid &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isNotTrivial;

  return {
    valid,
    isLengthValid,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    isNotTrivial,
    score: Math.min(100, criteriaCount),
    reason: !isLengthValid
      ? 'Le mot de passe doit comporter au moins 10 caractères'
      : !hasUpperCase
      ? 'Le mot de passe doit contenir au moins une lettre majuscule'
      : !hasLowerCase
      ? 'Le mot de passe doit contenir au moins une lettre minuscule'
      : !hasNumber
      ? 'Le mot de passe doit contenir au moins un chiffre'
      : !hasSpecialChar
      ? 'Le mot de passe doit inclure un caractère spécial (!@#$%...)'
      : !isNotTrivial
      ? 'Le mot de passe est trop prévisible ou contient une séquence simple'
      : undefined,
  };
};

export const validatePasswordFull = async (
  password: string
): Promise<{ valid: boolean; isPwned: boolean; reason?: string }> => {
  const policy = evaluatePasswordPolicy(password);
  if (!policy.valid) {
    return { valid: false, isPwned: false, reason: policy.reason };
  }

  const isPwned = await checkPwnedPassword(password);
  if (isPwned) {
    return {
      valid: false,
      isPwned: true,
      reason:
        'Alerte de sécurité: ce mot de passe figure dans une base publique de fuites de données. Veuillez en choisir un autre.',
    };
  }

  return { valid: true, isPwned: false };
};
