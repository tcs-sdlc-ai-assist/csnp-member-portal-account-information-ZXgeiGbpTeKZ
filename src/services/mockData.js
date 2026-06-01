/**
 * Mock data factory (MockDataFactory).
 * Exports functions that return default mock data for development and testing,
 * and an initializer that seeds localStorage with defaults if empty.
 *
 * @module mockData
 * @see SCRUM-9278
 * @see SCRUM-9284
 */

import { STORAGE_KEYS, NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '../constants.js';
import { getItem, setItem } from './localStorageManager.js';

/**
 * Returns default account information for a mock member.
 *
 * @returns {{ name: string, address: string, email: string, phone: string, memberId: string }}
 */
export function getDefaultAccountInfo() {
  return {
    name: 'Jane Doe',
    address: '123 Main St, Springfield, IL 62701',
    email: 'jane.doe@email.com',
    phone: '555-1234',
    memberId: 'M1234567',
  };
}

/**
 * Returns an array of default mock authorized representatives.
 *
 * @returns {Array<{ id: string, name: string, relationship: string, phone: string, email: string }>}
 */
export function getDefaultRepresentatives() {
  return [
    {
      id: 'rep-001',
      name: 'John Doe',
      relationship: 'Spouse',
      phone: '555-5678',
      email: 'john.doe@email.com',
    },
    {
      id: 'rep-002',
      name: 'Mary Smith',
      relationship: 'Daughter',
      phone: '555-9012',
      email: 'mary.smith@email.com',
    },
  ];
}

/**
 * Returns default privacy settings for a mock member.
 *
 * @returns {{ shareDataWithProviders: boolean, allowAnalytics: boolean, hipaaAcknowledged: boolean }}
 */
export function getDefaultPrivacySettings() {
  return {
    shareDataWithProviders: true,
    allowAnalytics: false,
    hipaaAcknowledged: true,
  };
}

/**
 * Returns default communication preferences with per-category notification settings.
 *
 * @returns {Array<{ category: string, channel: string, enabled: boolean }>}
 */
export function getDefaultCommunicationPrefs() {
  return NOTIFICATION_CATEGORIES.map((category, index) => ({
    category,
    channel: NOTIFICATION_CHANNELS[index % NOTIFICATION_CHANNELS.length],
    enabled: true,
  }));
}

/**
 * Returns default PCP (Primary Care Provider) information.
 *
 * @returns {{ providerName: string, providerPhone: string, clinic: string, address: string, lastVisit: string, effectiveDate: string }}
 */
export function getDefaultPCPInfo() {
  return {
    providerName: 'Dr. Sarah Johnson',
    providerPhone: '555-3456',
    clinic: 'Springfield Family Medicine',
    address: '456 Oak Ave, Springfield, IL 62702',
    lastVisit: '2024-04-15',
    effectiveDate: '2023-01-01',
  };
}

/**
 * Returns a default mock authentication session.
 *
 * @returns {{ isAuthenticated: boolean, memberId: string, loginTimestamp: string, expiresAt: string }}
 */
export function getDefaultSession() {
  return {
    isAuthenticated: true,
    memberId: 'M1234567',
    loginTimestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Seeds localStorage with default mock data for any keys that are currently empty.
 * Only writes a value if the corresponding key does not already exist in storage.
 *
 * @returns {void}
 */
export function initializeMockData() {
  if (getItem(STORAGE_KEYS.AUTH_SESSION) === null) {
    setItem(STORAGE_KEYS.AUTH_SESSION, getDefaultSession());
  }

  if (getItem(STORAGE_KEYS.ACCOUNT_INFO) === null) {
    setItem(STORAGE_KEYS.ACCOUNT_INFO, getDefaultAccountInfo());
  }

  if (getItem(STORAGE_KEYS.REPRESENTATIVES) === null) {
    setItem(STORAGE_KEYS.REPRESENTATIVES, getDefaultRepresentatives());
  }

  if (getItem(STORAGE_KEYS.PRIVACY_SETTINGS) === null) {
    setItem(STORAGE_KEYS.PRIVACY_SETTINGS, getDefaultPrivacySettings());
  }

  if (getItem(STORAGE_KEYS.COMMUNICATION_PREFS) === null) {
    setItem(STORAGE_KEYS.COMMUNICATION_PREFS, getDefaultCommunicationPrefs());
  }

  if (getItem(STORAGE_KEYS.PCP_INFO) === null) {
    setItem(STORAGE_KEYS.PCP_INFO, getDefaultPCPInfo());
  }
}