/**
 * Application-wide constants and configuration values for the CSNP Member Portal.
 */

/**
 * localStorage keys used throughout the application.
 * @readonly
 * @enum {string}
 */
export const STORAGE_KEYS = {
  AUTH_SESSION: 'csnp_auth_session',
  ACCOUNT_INFO: 'csnp_account_info',
  REPRESENTATIVES: 'csnp_representatives',
  PRIVACY_SETTINGS: 'csnp_privacy_settings',
  COMMUNICATION_PREFS: 'csnp_communication_prefs',
  PCP_INFO: 'csnp_pcp_info',
};

/**
 * Available notification categories for member communication preferences.
 * @type {string[]}
 */
export const NOTIFICATION_CATEGORIES = [
  'Coverage Info',
  'Processed Requests',
  'Health & Wellness',
];

/**
 * Available notification channel options for member communication preferences.
 * @type {string[]}
 */
export const NOTIFICATION_CHANNELS = [
  'Text',
  'Email',
  'Both',
];

/**
 * Available reasons a member may request a PCP (Primary Care Provider) change.
 * @type {string[]}
 */
export const PCP_CHANGE_REASONS = [
  'Relocation',
  'Provider no longer in network',
  'Dissatisfaction with current provider',
  'Seeking a specialist',
  'Schedule or availability conflicts',
  'Other',
];

/**
 * Reference date used for date-sensitive features such as enrollment periods
 * and eligibility checks.
 * @type {string}
 */
export const REFERENCE_DATE = import.meta.env.VITE_REFERENCE_DATE || '2024-06-11';