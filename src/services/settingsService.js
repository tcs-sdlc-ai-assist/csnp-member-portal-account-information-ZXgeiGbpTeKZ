/**
 * Unified settings CRUD service for all member data domains (SettingsService/MemberSettingsManager).
 * All read/write operations use LocalStorageManager for persistence.
 * Uses MockDataFactory for defaults when no data exists in localStorage.
 *
 * @module settingsService
 * @see SCRUM-9277
 * @see SCRUM-9276
 * @see SCRUM-9275
 * @see SCRUM-9273
 * @see SCRUM-9278
 * @see SCRUM-9280
 * @see SCRUM-9281
 * @see SCRUM-9282
 * @see SCRUM-9283
 * @see SCRUM-9284
 */

import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem } from './localStorageManager.js';
import {
  getDefaultAccountInfo,
  getDefaultRepresentatives,
  getDefaultPrivacySettings,
  getDefaultCommunicationPrefs,
  getDefaultPCPInfo,
} from './mockData.js';

/**
 * Retrieves the current account information from localStorage.
 * Falls back to default mock data if no data exists.
 *
 * @returns {{ name: string, address: string, email: string, phone: string, memberId: string }}
 */
export function getAccountInfo() {
  try {
    const data = getItem(STORAGE_KEYS.ACCOUNT_INFO);
    if (data) {
      return data;
    }
    const defaults = getDefaultAccountInfo();
    setItem(STORAGE_KEYS.ACCOUNT_INFO, defaults);
    return defaults;
  } catch {
    return getDefaultAccountInfo();
  }
}

/**
 * Updates the account information in localStorage.
 * Merges the provided data with the existing account info, preserving the memberId.
 *
 * @param {{ name?: string, address?: string, email?: string, phone?: string }} data - The fields to update.
 * @returns {{ success: boolean, accountInfo?: { name: string, address: string, email: string, phone: string, memberId: string }, error?: string }}
 */
export function updateAccountInfo(data) {
  try {
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid account data provided.' };
    }

    const current = getAccountInfo();

    const updated = {
      ...current,
      ...data,
      memberId: current.memberId,
    };

    const stored = setItem(STORAGE_KEYS.ACCOUNT_INFO, updated);

    if (!stored) {
      return { success: false, error: 'Failed to save account information. localStorage may be unavailable.' };
    }

    return { success: true, accountInfo: updated };
  } catch {
    return { success: false, error: 'An unexpected error occurred while updating account information.' };
  }
}

/**
 * Retrieves the list of authorized representatives from localStorage.
 * Falls back to default mock data if no data exists.
 *
 * @returns {Array<{ id: string, name: string, relationship: string, phone: string, email: string }>}
 */
export function getRepresentatives() {
  try {
    const data = getItem(STORAGE_KEYS.REPRESENTATIVES);
    if (Array.isArray(data)) {
      return data;
    }
    const defaults = getDefaultRepresentatives();
    setItem(STORAGE_KEYS.REPRESENTATIVES, defaults);
    return defaults;
  } catch {
    return getDefaultRepresentatives();
  }
}

/**
 * Adds a new authorized representative to localStorage.
 *
 * @param {{ name: string, relationship: string, phone: string, email: string }} rep - The representative to add.
 * @returns {{ success: boolean, representatives?: Array<{ id: string, name: string, relationship: string, phone: string, email: string }>, error?: string }}
 */
export function addRepresentative(rep) {
  try {
    if (!rep || typeof rep !== 'object') {
      return { success: false, error: 'Invalid representative data provided.' };
    }

    if (!rep.name || !rep.relationship) {
      return { success: false, error: 'Name and relationship are required for a representative.' };
    }

    const current = getRepresentatives();

    const newRep = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: String(rep.name).trim(),
      relationship: String(rep.relationship).trim(),
      phone: rep.phone ? String(rep.phone).trim() : '',
      email: rep.email ? String(rep.email).trim() : '',
    };

    const updated = [...current, newRep];

    const stored = setItem(STORAGE_KEYS.REPRESENTATIVES, updated);

    if (!stored) {
      return { success: false, error: 'Failed to save representative. localStorage may be unavailable.' };
    }

    return { success: true, representatives: updated };
  } catch {
    return { success: false, error: 'An unexpected error occurred while adding representative.' };
  }
}

/**
 * Edits an existing authorized representative in localStorage.
 *
 * @param {string} id - The unique identifier of the representative to edit.
 * @param {{ name?: string, relationship?: string, phone?: string, email?: string }} data - The fields to update.
 * @returns {{ success: boolean, representatives?: Array<{ id: string, name: string, relationship: string, phone: string, email: string }>, error?: string }}
 */
export function editRepresentative(id, data) {
  try {
    if (!id) {
      return { success: false, error: 'Representative ID is required.' };
    }

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid representative data provided.' };
    }

    const current = getRepresentatives();
    const index = current.findIndex((rep) => rep.id === id);

    if (index === -1) {
      return { success: false, error: 'Representative not found.' };
    }

    const updatedRep = {
      ...current[index],
      ...data,
      id: current[index].id,
    };

    const updated = [...current];
    updated[index] = updatedRep;

    const stored = setItem(STORAGE_KEYS.REPRESENTATIVES, updated);

    if (!stored) {
      return { success: false, error: 'Failed to save representative changes. localStorage may be unavailable.' };
    }

    return { success: true, representatives: updated };
  } catch {
    return { success: false, error: 'An unexpected error occurred while editing representative.' };
  }
}

/**
 * Removes an authorized representative from localStorage.
 *
 * @param {string} id - The unique identifier of the representative to remove.
 * @returns {{ success: boolean, representatives?: Array<{ id: string, name: string, relationship: string, phone: string, email: string }>, error?: string }}
 */
export function removeRepresentative(id) {
  try {
    if (!id) {
      return { success: false, error: 'Representative ID is required.' };
    }

    const current = getRepresentatives();
    const index = current.findIndex((rep) => rep.id === id);

    if (index === -1) {
      return { success: false, error: 'Representative not found.' };
    }

    const updated = current.filter((rep) => rep.id !== id);

    const stored = setItem(STORAGE_KEYS.REPRESENTATIVES, updated);

    if (!stored) {
      return { success: false, error: 'Failed to remove representative. localStorage may be unavailable.' };
    }

    return { success: true, representatives: updated };
  } catch {
    return { success: false, error: 'An unexpected error occurred while removing representative.' };
  }
}

/**
 * Retrieves the current privacy settings from localStorage.
 * Falls back to default mock data if no data exists.
 *
 * @returns {{ shareDataWithProviders: boolean, allowAnalytics: boolean, hipaaAcknowledged: boolean }}
 */
export function getPrivacySettings() {
  try {
    const data = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    if (data) {
      return data;
    }
    const defaults = getDefaultPrivacySettings();
    setItem(STORAGE_KEYS.PRIVACY_SETTINGS, defaults);
    return defaults;
  } catch {
    return getDefaultPrivacySettings();
  }
}

/**
 * Updates the privacy settings in localStorage.
 *
 * @param {{ shareDataWithProviders?: boolean, allowAnalytics?: boolean, hipaaAcknowledged?: boolean }} data - The privacy settings to update.
 * @returns {{ success: boolean, privacySettings?: { shareDataWithProviders: boolean, allowAnalytics: boolean, hipaaAcknowledged: boolean }, error?: string }}
 */
export function updatePrivacySettings(data) {
  try {
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid privacy settings data provided.' };
    }

    const current = getPrivacySettings();

    const updated = {
      ...current,
      ...data,
    };

    const stored = setItem(STORAGE_KEYS.PRIVACY_SETTINGS, updated);

    if (!stored) {
      return { success: false, error: 'Failed to save privacy settings. localStorage may be unavailable.' };
    }

    return { success: true, privacySettings: updated };
  } catch {
    return { success: false, error: 'An unexpected error occurred while updating privacy settings.' };
  }
}

/**
 * Retrieves the current communication preferences from localStorage.
 * Falls back to default mock data if no data exists.
 *
 * @returns {Array<{ category: string, channel: string, enabled: boolean }>}
 */
export function getCommunicationPreferences() {
  try {
    const data = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
    if (Array.isArray(data)) {
      return data;
    }
    const defaults = getDefaultCommunicationPrefs();
    setItem(STORAGE_KEYS.COMMUNICATION_PREFS, defaults);
    return defaults;
  } catch {
    return getDefaultCommunicationPrefs();
  }
}

/**
 * Updates the communication preferences in localStorage.
 *
 * @param {Array<{ category: string, channel: string, enabled: boolean }>} data - The updated communication preferences.
 * @returns {{ success: boolean, communicationPreferences?: Array<{ category: string, channel: string, enabled: boolean }>, error?: string }}
 */
export function updateCommunicationPreferences(data) {
  try {
    if (!data || !Array.isArray(data)) {
      return { success: false, error: 'Invalid communication preferences data provided.' };
    }

    const stored = setItem(STORAGE_KEYS.COMMUNICATION_PREFS, data);

    if (!stored) {
      return { success: false, error: 'Failed to save communication preferences. localStorage may be unavailable.' };
    }

    return { success: true, communicationPreferences: data };
  } catch {
    return { success: false, error: 'An unexpected error occurred while updating communication preferences.' };
  }
}

/**
 * Retrieves the current PCP (Primary Care Provider) information from localStorage.
 * Falls back to default mock data if no data exists.
 *
 * @returns {{ providerName: string, providerPhone: string, clinic: string, address: string, lastVisit: string, effectiveDate: string }}
 */
export function getPCPInfo() {
  try {
    const data = getItem(STORAGE_KEYS.PCP_INFO);
    if (data) {
      return data;
    }
    const defaults = getDefaultPCPInfo();
    setItem(STORAGE_KEYS.PCP_INFO, defaults);
    return defaults;
  } catch {
    return getDefaultPCPInfo();
  }
}

/**
 * Simulates a PCP change request. Randomly succeeds (~80%) or fails (~20%) to
 * demonstrate both happy and sad paths.
 *
 * @param {{ reason: string, providerName: string, providerPhone?: string, clinic?: string, address?: string }} newPCP - The new PCP details and reason for change.
 * @returns {{ success: boolean, pcpInfo?: { providerName: string, providerPhone: string, clinic: string, address: string, lastVisit: string, effectiveDate: string }, confirmation?: string, error?: string }}
 */
export function changePCP(newPCP) {
  try {
    if (!newPCP || typeof newPCP !== 'object') {
      return { success: false, error: 'Invalid PCP data provided.' };
    }

    if (!newPCP.reason) {
      return { success: false, error: 'A reason for the PCP change is required.' };
    }

    if (!newPCP.providerName) {
      return { success: false, error: 'New provider name is required.' };
    }

    // Simulate random outcome: ~80% success, ~20% failure
    if (Math.random() < 0.8) {
      const current = getPCPInfo();

      const updated = {
        providerName: String(newPCP.providerName).trim(),
        providerPhone: newPCP.providerPhone ? String(newPCP.providerPhone).trim() : current.providerPhone,
        clinic: newPCP.clinic ? String(newPCP.clinic).trim() : current.clinic,
        address: newPCP.address ? String(newPCP.address).trim() : current.address,
        lastVisit: current.lastVisit,
        effectiveDate: new Date().toISOString().split('T')[0],
      };

      const stored = setItem(STORAGE_KEYS.PCP_INFO, updated);

      if (!stored) {
        return { success: false, error: 'Failed to save PCP information. localStorage may be unavailable.' };
      }

      return {
        success: true,
        pcpInfo: updated,
        confirmation: 'PCP change successful. Expected turnaround: 2 business days (mock).',
      };
    } else {
      return {
        success: false,
        error: 'Simulated error: PCP change failed. Email notification sent (mock).',
      };
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred while changing PCP.' };
  }
}