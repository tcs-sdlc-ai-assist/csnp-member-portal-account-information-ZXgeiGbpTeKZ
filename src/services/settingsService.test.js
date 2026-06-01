import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAccountInfo,
  updateAccountInfo,
  getRepresentatives,
  addRepresentative,
  editRepresentative,
  removeRepresentative,
  getPrivacySettings,
  updatePrivacySettings,
  getCommunicationPreferences,
  updateCommunicationPreferences,
  getPCPInfo,
  changePCP,
} from './settingsService.js';
import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem } from './localStorageManager.js';
import { initializeMockData } from './mockData.js';

describe('settingsService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('getAccountInfo', () => {
    it('returns default account info when localStorage is empty', () => {
      const info = getAccountInfo();

      expect(info).toBeDefined();
      expect(info.name).toBe('Jane Doe');
      expect(info.address).toBe('123 Main St, Springfield, IL 62701');
      expect(info.email).toBe('jane.doe@email.com');
      expect(info.phone).toBe('555-1234');
      expect(info.memberId).toBe('M1234567');
    });

    it('persists defaults to localStorage when empty', () => {
      getAccountInfo();

      const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
      expect(stored).not.toBeNull();
      expect(stored.name).toBe('Jane Doe');
    });

    it('returns existing account info from localStorage', () => {
      const custom = {
        name: 'Custom User',
        address: '999 Custom Rd',
        email: 'custom@test.com',
        phone: '555-9999',
        memberId: 'M9999999',
      };
      setItem(STORAGE_KEYS.ACCOUNT_INFO, custom);

      const info = getAccountInfo();

      expect(info.name).toBe('Custom User');
      expect(info.email).toBe('custom@test.com');
      expect(info.memberId).toBe('M9999999');
    });
  });

  describe('updateAccountInfo', () => {
    it('persists changes and returns updated account info', () => {
      initializeMockData();

      const result = updateAccountInfo({ name: 'Updated Name', email: 'updated@test.com' });

      expect(result.success).toBe(true);
      expect(result.accountInfo).toBeDefined();
      expect(result.accountInfo.name).toBe('Updated Name');
      expect(result.accountInfo.email).toBe('updated@test.com');

      const stored = getItem(STORAGE_KEYS.ACCOUNT_INFO);
      expect(stored.name).toBe('Updated Name');
      expect(stored.email).toBe('updated@test.com');
    });

    it('preserves memberId when updating other fields', () => {
      initializeMockData();

      const result = updateAccountInfo({ name: 'New Name', memberId: 'SHOULD_NOT_CHANGE' });

      expect(result.success).toBe(true);
      expect(result.accountInfo.memberId).toBe('M1234567');
    });

    it('merges partial updates with existing data', () => {
      initializeMockData();

      const result = updateAccountInfo({ phone: '555-0000' });

      expect(result.success).toBe(true);
      expect(result.accountInfo.phone).toBe('555-0000');
      expect(result.accountInfo.name).toBe('Jane Doe');
      expect(result.accountInfo.email).toBe('jane.doe@email.com');
    });

    it('returns error when data is null', () => {
      const result = updateAccountInfo(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid account data provided.');
    });

    it('returns error when data is not an object', () => {
      const result = updateAccountInfo('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid account data provided.');
    });
  });

  describe('getRepresentatives', () => {
    it('returns default representatives when localStorage is empty', () => {
      const reps = getRepresentatives();

      expect(Array.isArray(reps)).toBe(true);
      expect(reps.length).toBe(2);
      expect(reps[0].name).toBe('John Doe');
      expect(reps[0].relationship).toBe('Spouse');
      expect(reps[1].name).toBe('Mary Smith');
    });

    it('persists defaults to localStorage when empty', () => {
      getRepresentatives();

      const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
      expect(stored).not.toBeNull();
      expect(Array.isArray(stored)).toBe(true);
      expect(stored.length).toBe(2);
    });

    it('returns existing representatives from localStorage', () => {
      const custom = [{ id: 'rep-custom', name: 'Custom Rep', relationship: 'Parent', phone: '', email: '' }];
      setItem(STORAGE_KEYS.REPRESENTATIVES, custom);

      const reps = getRepresentatives();

      expect(reps.length).toBe(1);
      expect(reps[0].name).toBe('Custom Rep');
    });
  });

  describe('addRepresentative', () => {
    it('adds a new representative and persists to localStorage', () => {
      initializeMockData();

      const result = addRepresentative({
        name: 'New Rep',
        relationship: 'Child',
        phone: '555-1111',
        email: 'newrep@test.com',
      });

      expect(result.success).toBe(true);
      expect(result.representatives).toBeDefined();
      expect(result.representatives.length).toBe(3);

      const added = result.representatives[2];
      expect(added.name).toBe('New Rep');
      expect(added.relationship).toBe('Child');
      expect(added.phone).toBe('555-1111');
      expect(added.email).toBe('newrep@test.com');
      expect(added.id).toBeDefined();

      const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
      expect(stored.length).toBe(3);
    });

    it('generates a unique id for the new representative', () => {
      initializeMockData();

      const result = addRepresentative({
        name: 'Rep A',
        relationship: 'Spouse',
        phone: '',
        email: '',
      });

      expect(result.success).toBe(true);
      const newRep = result.representatives[result.representatives.length - 1];
      expect(newRep.id).toMatch(/^rep-/);
    });

    it('trims whitespace from fields', () => {
      initializeMockData();

      const result = addRepresentative({
        name: '  Trimmed Name  ',
        relationship: '  Child  ',
        phone: '  555-0000  ',
        email: '  trim@test.com  ',
      });

      expect(result.success).toBe(true);
      const added = result.representatives[result.representatives.length - 1];
      expect(added.name).toBe('Trimmed Name');
      expect(added.relationship).toBe('Child');
      expect(added.phone).toBe('555-0000');
      expect(added.email).toBe('trim@test.com');
    });

    it('returns error when data is null', () => {
      const result = addRepresentative(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid representative data provided.');
    });

    it('returns error when name is missing', () => {
      const result = addRepresentative({ relationship: 'Spouse' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name and relationship are required for a representative.');
    });

    it('returns error when relationship is missing', () => {
      const result = addRepresentative({ name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name and relationship are required for a representative.');
    });

    it('handles optional phone and email as empty strings', () => {
      initializeMockData();

      const result = addRepresentative({
        name: 'No Contact',
        relationship: 'Other',
      });

      expect(result.success).toBe(true);
      const added = result.representatives[result.representatives.length - 1];
      expect(added.phone).toBe('');
      expect(added.email).toBe('');
    });
  });

  describe('editRepresentative', () => {
    it('edits an existing representative and persists changes', () => {
      initializeMockData();

      const result = editRepresentative('rep-001', { name: 'John Updated', phone: '555-9999' });

      expect(result.success).toBe(true);
      expect(result.representatives).toBeDefined();

      const edited = result.representatives.find((r) => r.id === 'rep-001');
      expect(edited.name).toBe('John Updated');
      expect(edited.phone).toBe('555-9999');
      expect(edited.relationship).toBe('Spouse');

      const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
      const storedEdited = stored.find((r) => r.id === 'rep-001');
      expect(storedEdited.name).toBe('John Updated');
    });

    it('preserves the representative id when editing', () => {
      initializeMockData();

      const result = editRepresentative('rep-001', { id: 'should-not-change', name: 'Test' });

      expect(result.success).toBe(true);
      const edited = result.representatives.find((r) => r.id === 'rep-001');
      expect(edited.id).toBe('rep-001');
    });

    it('returns error when id is empty', () => {
      const result = editRepresentative('', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative ID is required.');
    });

    it('returns error when id is null', () => {
      const result = editRepresentative(null, { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative ID is required.');
    });

    it('returns error when data is null', () => {
      const result = editRepresentative('rep-001', null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid representative data provided.');
    });

    it('returns error when representative is not found', () => {
      initializeMockData();

      const result = editRepresentative('rep-nonexistent', { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative not found.');
    });

    it('does not affect other representatives', () => {
      initializeMockData();

      const result = editRepresentative('rep-001', { name: 'Changed' });

      expect(result.success).toBe(true);
      const other = result.representatives.find((r) => r.id === 'rep-002');
      expect(other.name).toBe('Mary Smith');
    });
  });

  describe('removeRepresentative', () => {
    it('removes a representative and persists changes', () => {
      initializeMockData();

      const result = removeRepresentative('rep-001');

      expect(result.success).toBe(true);
      expect(result.representatives).toBeDefined();
      expect(result.representatives.length).toBe(1);
      expect(result.representatives.find((r) => r.id === 'rep-001')).toBeUndefined();

      const stored = getItem(STORAGE_KEYS.REPRESENTATIVES);
      expect(stored.length).toBe(1);
    });

    it('does not affect other representatives when removing', () => {
      initializeMockData();

      const result = removeRepresentative('rep-001');

      expect(result.success).toBe(true);
      expect(result.representatives[0].id).toBe('rep-002');
      expect(result.representatives[0].name).toBe('Mary Smith');
    });

    it('returns error when id is empty', () => {
      const result = removeRepresentative('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative ID is required.');
    });

    it('returns error when id is null', () => {
      const result = removeRepresentative(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative ID is required.');
    });

    it('returns error when representative is not found', () => {
      initializeMockData();

      const result = removeRepresentative('rep-nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Representative not found.');
    });
  });

  describe('getPrivacySettings', () => {
    it('returns default privacy settings when localStorage is empty', () => {
      const settings = getPrivacySettings();

      expect(settings).toBeDefined();
      expect(settings.shareDataWithProviders).toBe(true);
      expect(settings.allowAnalytics).toBe(false);
      expect(settings.hipaaAcknowledged).toBe(true);
    });

    it('persists defaults to localStorage when empty', () => {
      getPrivacySettings();

      const stored = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
      expect(stored).not.toBeNull();
      expect(stored.shareDataWithProviders).toBe(true);
    });

    it('returns existing privacy settings from localStorage', () => {
      const custom = { shareDataWithProviders: false, allowAnalytics: true, hipaaAcknowledged: false };
      setItem(STORAGE_KEYS.PRIVACY_SETTINGS, custom);

      const settings = getPrivacySettings();

      expect(settings.shareDataWithProviders).toBe(false);
      expect(settings.allowAnalytics).toBe(true);
      expect(settings.hipaaAcknowledged).toBe(false);
    });
  });

  describe('updatePrivacySettings', () => {
    it('persists changes and returns updated privacy settings', () => {
      initializeMockData();

      const result = updatePrivacySettings({ allowAnalytics: true });

      expect(result.success).toBe(true);
      expect(result.privacySettings).toBeDefined();
      expect(result.privacySettings.allowAnalytics).toBe(true);
      expect(result.privacySettings.shareDataWithProviders).toBe(true);

      const stored = getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
      expect(stored.allowAnalytics).toBe(true);
    });

    it('merges partial updates with existing settings', () => {
      initializeMockData();

      const result = updatePrivacySettings({ shareDataWithProviders: false });

      expect(result.success).toBe(true);
      expect(result.privacySettings.shareDataWithProviders).toBe(false);
      expect(result.privacySettings.allowAnalytics).toBe(false);
      expect(result.privacySettings.hipaaAcknowledged).toBe(true);
    });

    it('returns error when data is null', () => {
      const result = updatePrivacySettings(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid privacy settings data provided.');
    });

    it('returns error when data is not an object', () => {
      const result = updatePrivacySettings('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid privacy settings data provided.');
    });
  });

  describe('getCommunicationPreferences', () => {
    it('returns default communication preferences when localStorage is empty', () => {
      const prefs = getCommunicationPreferences();

      expect(Array.isArray(prefs)).toBe(true);
      expect(prefs.length).toBe(3);
      expect(prefs[0].category).toBe('Coverage Info');
      expect(prefs[0].enabled).toBe(true);
      expect(prefs[1].category).toBe('Processed Requests');
      expect(prefs[2].category).toBe('Health & Wellness');
    });

    it('persists defaults to localStorage when empty', () => {
      getCommunicationPreferences();

      const stored = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
      expect(stored).not.toBeNull();
      expect(Array.isArray(stored)).toBe(true);
      expect(stored.length).toBe(3);
    });

    it('returns existing communication preferences from localStorage', () => {
      const custom = [
        { category: 'Coverage Info', channel: 'Email', enabled: true },
      ];
      setItem(STORAGE_KEYS.COMMUNICATION_PREFS, custom);

      const prefs = getCommunicationPreferences();

      expect(prefs.length).toBe(1);
      expect(prefs[0].channel).toBe('Email');
    });

    it('returns defaults when stored value is not an array', () => {
      setItem(STORAGE_KEYS.COMMUNICATION_PREFS, { notAnArray: true });

      const prefs = getCommunicationPreferences();

      expect(Array.isArray(prefs)).toBe(true);
      expect(prefs.length).toBe(3);
    });
  });

  describe('updateCommunicationPreferences', () => {
    it('persists changes and returns updated preferences', () => {
      initializeMockData();

      const updated = [
        { category: 'Coverage Info', channel: 'Both', enabled: true },
        { category: 'Processed Requests', channel: '', enabled: false },
        { category: 'Health & Wellness', channel: 'Text', enabled: true },
      ];

      const result = updateCommunicationPreferences(updated);

      expect(result.success).toBe(true);
      expect(result.communicationPreferences).toBeDefined();
      expect(result.communicationPreferences.length).toBe(3);
      expect(result.communicationPreferences[0].channel).toBe('Both');
      expect(result.communicationPreferences[1].enabled).toBe(false);

      const stored = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
      expect(stored[0].channel).toBe('Both');
      expect(stored[1].channel).toBe('');
    });

    it('returns error when data is null', () => {
      const result = updateCommunicationPreferences(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid communication preferences data provided.');
    });

    it('returns error when data is not an array', () => {
      const result = updateCommunicationPreferences({ notAnArray: true });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid communication preferences data provided.');
    });

    it('accepts an empty array', () => {
      const result = updateCommunicationPreferences([]);

      expect(result.success).toBe(true);
      expect(result.communicationPreferences).toEqual([]);

      const stored = getItem(STORAGE_KEYS.COMMUNICATION_PREFS);
      expect(stored).toEqual([]);
    });
  });

  describe('getPCPInfo', () => {
    it('returns default PCP info when localStorage is empty', () => {
      const pcp = getPCPInfo();

      expect(pcp).toBeDefined();
      expect(pcp.providerName).toBe('Dr. Sarah Johnson');
      expect(pcp.providerPhone).toBe('555-3456');
      expect(pcp.clinic).toBe('Springfield Family Medicine');
      expect(pcp.address).toBe('456 Oak Ave, Springfield, IL 62702');
      expect(pcp.lastVisit).toBe('2024-04-15');
      expect(pcp.effectiveDate).toBe('2023-01-01');
    });

    it('persists defaults to localStorage when empty', () => {
      getPCPInfo();

      const stored = getItem(STORAGE_KEYS.PCP_INFO);
      expect(stored).not.toBeNull();
      expect(stored.providerName).toBe('Dr. Sarah Johnson');
    });

    it('returns existing PCP info from localStorage', () => {
      const custom = {
        providerName: 'Dr. Custom',
        providerPhone: '555-0000',
        clinic: 'Custom Clinic',
        address: '1 Custom St',
        lastVisit: '2024-01-01',
        effectiveDate: '2024-01-01',
      };
      setItem(STORAGE_KEYS.PCP_INFO, custom);

      const pcp = getPCPInfo();

      expect(pcp.providerName).toBe('Dr. Custom');
      expect(pcp.clinic).toBe('Custom Clinic');
    });
  });

  describe('changePCP', () => {
    it('returns error when data is null', () => {
      const result = changePCP(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid PCP data provided.');
    });

    it('returns error when data is not an object', () => {
      const result = changePCP('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid PCP data provided.');
    });

    it('returns error when reason is missing', () => {
      const result = changePCP({ providerName: 'Dr. New' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('A reason for the PCP change is required.');
    });

    it('returns error when providerName is missing', () => {
      const result = changePCP({ reason: 'Relocation' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('New provider name is required.');
    });

    it('succeeds or fails based on random outcome and persists on success', () => {
      initializeMockData();

      // Run multiple times to cover both success and failure paths
      let hadSuccess = false;
      let hadFailure = false;

      // Use a deterministic approach: mock Math.random
      const originalRandom = Math.random;

      // Test success path (Math.random returns 0.5, which is < 0.8)
      Math.random = () => 0.5;

      const successResult = changePCP({
        reason: 'Relocation',
        providerName: 'Dr. New Provider',
        providerPhone: '555-7777',
        clinic: 'New Clinic',
        address: '789 New St',
      });

      expect(successResult.success).toBe(true);
      expect(successResult.pcpInfo).toBeDefined();
      expect(successResult.pcpInfo.providerName).toBe('Dr. New Provider');
      expect(successResult.pcpInfo.providerPhone).toBe('555-7777');
      expect(successResult.pcpInfo.clinic).toBe('New Clinic');
      expect(successResult.pcpInfo.address).toBe('789 New St');
      expect(successResult.confirmation).toBeDefined();

      const stored = getItem(STORAGE_KEYS.PCP_INFO);
      expect(stored.providerName).toBe('Dr. New Provider');

      // Test failure path (Math.random returns 0.9, which is >= 0.8)
      Math.random = () => 0.9;

      const failResult = changePCP({
        reason: 'Relocation',
        providerName: 'Dr. Another',
      });

      expect(failResult.success).toBe(false);
      expect(failResult.error).toBeDefined();

      Math.random = originalRandom;
    });

    it('trims provider name on success', () => {
      initializeMockData();

      const originalRandom = Math.random;
      Math.random = () => 0.1;

      const result = changePCP({
        reason: 'Relocation',
        providerName: '  Dr. Trimmed  ',
        providerPhone: '  555-0000  ',
        clinic: '  Trimmed Clinic  ',
        address: '  123 Trimmed St  ',
      });

      expect(result.success).toBe(true);
      expect(result.pcpInfo.providerName).toBe('Dr. Trimmed');
      expect(result.pcpInfo.providerPhone).toBe('555-0000');
      expect(result.pcpInfo.clinic).toBe('Trimmed Clinic');
      expect(result.pcpInfo.address).toBe('123 Trimmed St');

      Math.random = originalRandom;
    });

    it('sets effectiveDate to today on success', () => {
      initializeMockData();

      const originalRandom = Math.random;
      Math.random = () => 0.1;

      const result = changePCP({
        reason: 'Relocation',
        providerName: 'Dr. Today',
      });

      expect(result.success).toBe(true);
      const today = new Date().toISOString().split('T')[0];
      expect(result.pcpInfo.effectiveDate).toBe(today);

      Math.random = originalRandom;
    });

    it('preserves lastVisit from previous PCP on success', () => {
      initializeMockData();

      const originalRandom = Math.random;
      Math.random = () => 0.1;

      const result = changePCP({
        reason: 'Relocation',
        providerName: 'Dr. New',
      });

      expect(result.success).toBe(true);
      expect(result.pcpInfo.lastVisit).toBe('2024-04-15');

      Math.random = originalRandom;
    });

    it('uses existing PCP values when optional fields are not provided on success', () => {
      initializeMockData();

      const originalRandom = Math.random;
      Math.random = () => 0.1;

      const result = changePCP({
        reason: 'Relocation',
        providerName: 'Dr. Minimal',
      });

      expect(result.success).toBe(true);
      expect(result.pcpInfo.providerPhone).toBe('555-3456');
      expect(result.pcpInfo.clinic).toBe('Springfield Family Medicine');
      expect(result.pcpInfo.address).toBe('456 Oak Ave, Springfield, IL 62702');

      Math.random = originalRandom;
    });
  });
});