/**
 * Client-side form input validation utilities.
 * Each validator returns an object with { valid: boolean, error: string|null }.
 *
 * @module validators
 * @see SCRUM-9277
 * @see SCRUM-9280
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the input passed validation.
 * @property {string|null} error - Error message if invalid, null if valid.
 */

/**
 * Validates that a required field has a non-empty value.
 *
 * @param {*} value - The value to check.
 * @param {string} fieldName - The human-readable field name for the error message.
 * @returns {ValidationResult} The validation result.
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required.` };
  }

  const str = String(value).trim();

  if (str.length === 0) {
    return { valid: false, error: `${fieldName} is required.` };
  }

  return { valid: true, error: null };
}

/**
 * Validates an email address format.
 * Checks for non-empty value and a basic email pattern (local@domain.tld).
 *
 * @param {string} email - The email address to validate.
 * @returns {ValidationResult} The validation result.
 */
export function validateEmail(email) {
  const requiredCheck = validateRequired(email, 'Email');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const str = String(email).trim();

  // Basic email pattern: at least one char before @, domain with at least one dot
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(str)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates a phone number.
 * Accepts common US formats and requires at least 10 digits.
 *
 * @param {string} phone - The phone number to validate.
 * @returns {ValidationResult} The validation result.
 */
export function validatePhone(phone) {
  const requiredCheck = validateRequired(phone, 'Phone number');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const str = String(phone).trim();
  const digits = str.replace(/\D/g, '');

  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must contain at least 10 digits.' };
  }

  if (digits.length > 15) {
    return { valid: false, error: 'Phone number must not exceed 15 digits.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates a person's name.
 * Checks for non-empty value, minimum length, and allowed characters
 * (letters, spaces, hyphens, apostrophes, and periods).
 *
 * @param {string} name - The name to validate.
 * @returns {ValidationResult} The validation result.
 */
export function validateName(name) {
  const requiredCheck = validateRequired(name, 'Name');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const str = String(name).trim();

  if (str.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long.' };
  }

  if (str.length > 100) {
    return { valid: false, error: 'Name must not exceed 100 characters.' };
  }

  const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-.]+$/;

  if (!namePattern.test(str)) {
    return { valid: false, error: 'Name contains invalid characters.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates a street address.
 * Checks for non-empty value and minimum length.
 *
 * @param {string} address - The address to validate.
 * @returns {ValidationResult} The validation result.
 */
export function validateAddress(address) {
  const requiredCheck = validateRequired(address, 'Address');
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  const str = String(address).trim();

  if (str.length < 5) {
    return { valid: false, error: 'Address must be at least 5 characters long.' };
  }

  if (str.length > 200) {
    return { valid: false, error: 'Address must not exceed 200 characters.' };
  }

  return { valid: true, error: null };
}