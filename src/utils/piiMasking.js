/**
 * PII masking utility for logs and debug output.
 * Provides functions to mask sensitive personally identifiable information
 * before it appears in console.log/debug statements.
 *
 * @module piiMasking
 * @see SCRUM-9277
 * @see SCRUM-9280
 */

/**
 * Known PII field types.
 * @readonly
 * @enum {string}
 */
export const PII_TYPES = {
  NAME: 'Name',
  EMAIL: 'Email',
  PHONE: 'Phone',
  ADDRESS: 'Address',
  MEMBER_ID: 'MemberId',
};

/**
 * Map of object keys (lowercase) to their PII type for automatic detection.
 * @type {Record<string, string>}
 */
const FIELD_TYPE_MAP = {
  name: PII_TYPES.NAME,
  firstname: PII_TYPES.NAME,
  first_name: PII_TYPES.NAME,
  firstName: PII_TYPES.NAME,
  lastname: PII_TYPES.NAME,
  last_name: PII_TYPES.NAME,
  lastName: PII_TYPES.NAME,
  fullname: PII_TYPES.NAME,
  full_name: PII_TYPES.NAME,
  fullName: PII_TYPES.NAME,
  email: PII_TYPES.EMAIL,
  emailaddress: PII_TYPES.EMAIL,
  email_address: PII_TYPES.EMAIL,
  emailAddress: PII_TYPES.EMAIL,
  phone: PII_TYPES.PHONE,
  phonenumber: PII_TYPES.PHONE,
  phone_number: PII_TYPES.PHONE,
  phoneNumber: PII_TYPES.PHONE,
  mobile: PII_TYPES.PHONE,
  telephone: PII_TYPES.PHONE,
  address: PII_TYPES.ADDRESS,
  streetaddress: PII_TYPES.ADDRESS,
  street_address: PII_TYPES.ADDRESS,
  streetAddress: PII_TYPES.ADDRESS,
  homeaddress: PII_TYPES.ADDRESS,
  home_address: PII_TYPES.ADDRESS,
  homeAddress: PII_TYPES.ADDRESS,
  memberid: PII_TYPES.MEMBER_ID,
  member_id: PII_TYPES.MEMBER_ID,
  memberId: PII_TYPES.MEMBER_ID,
};

/**
 * Masks a PII value based on its type.
 *
 * - Name: first letter + '***' (e.g., "John" → "J***")
 * - Email: first 2 chars + '***@domain' (e.g., "john@example.com" → "jo***@example.com")
 * - Phone: '***-' + last 4 digits (e.g., "555-123-4567" → "***-4567")
 * - Address: '*** ' + last word (e.g., "123 Main Street" → "*** Street")
 * - MemberId: 'M***' + last 3 chars (e.g., "M123456789" → "M***789")
 *
 * @param {string} value - The raw PII value to mask.
 * @param {string} type - One of the PII_TYPES values indicating the kind of data.
 * @returns {string} The masked value, or '[REDACTED]' if the value is empty or type is unknown.
 */
export function maskPII(value, type) {
  if (value === null || value === undefined) {
    return '[REDACTED]';
  }

  const str = String(value).trim();

  if (str.length === 0) {
    return '[REDACTED]';
  }

  switch (type) {
    case PII_TYPES.NAME: {
      return str.charAt(0) + '***';
    }

    case PII_TYPES.EMAIL: {
      const atIndex = str.indexOf('@');
      if (atIndex < 0) {
        return '***';
      }
      const domain = str.slice(atIndex);
      const localPart = str.slice(0, atIndex);
      const visibleChars = localPart.slice(0, 2);
      return visibleChars + '***' + domain;
    }

    case PII_TYPES.PHONE: {
      const digits = str.replace(/\D/g, '');
      const last4 = digits.length >= 4 ? digits.slice(-4) : digits;
      return '***-' + last4;
    }

    case PII_TYPES.ADDRESS: {
      const words = str.split(/\s+/);
      const lastWord = words.length > 0 ? words[words.length - 1] : '';
      return '*** ' + lastWord;
    }

    case PII_TYPES.MEMBER_ID: {
      const last3 = str.length >= 3 ? str.slice(-3) : str;
      return 'M***' + last3;
    }

    default: {
      return '[REDACTED]';
    }
  }
}

/**
 * Detects the PII type for a given object key.
 *
 * @param {string} key - The object property name.
 * @returns {string|null} The matching PII_TYPES value, or null if the key is not recognized as PII.
 */
function detectPIIType(key) {
  if (!key) {
    return null;
  }

  const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');

  for (const [fieldKey, piiType] of Object.entries(FIELD_TYPE_MAP)) {
    if (normalizedKey === fieldKey.toLowerCase().replace(/[-_\s]/g, '')) {
      return piiType;
    }
  }

  return null;
}

/**
 * Applies PII masking to all known PII fields in a plain object.
 * Returns a new object with sensitive fields masked. Non-PII fields
 * are copied as-is. Nested objects are processed recursively.
 * Arrays are processed element-by-element.
 *
 * @param {Object} obj - The object whose PII fields should be masked.
 * @returns {Object} A new object with PII fields masked.
 */
export function maskObjectForLog(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskObjectForLog(item));
  }

  const masked = {};

  for (const [key, value] of Object.entries(obj)) {
    const piiType = detectPIIType(key);

    if (piiType && (typeof value === 'string' || typeof value === 'number')) {
      masked[key] = maskPII(value, piiType);
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskObjectForLog(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}