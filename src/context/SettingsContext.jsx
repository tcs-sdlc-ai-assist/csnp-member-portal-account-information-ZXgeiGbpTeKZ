import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  getAccountInfo,
  updateAccountInfo as updateAccountInfoService,
  getRepresentatives,
  addRepresentative as addRepresentativeService,
  editRepresentative as editRepresentativeService,
  removeRepresentative as removeRepresentativeService,
  getPrivacySettings,
  updatePrivacySettings as updatePrivacySettingsService,
  getCommunicationPreferences,
  updateCommunicationPreferences as updateCommunicationPreferencesService,
  getPCPInfo,
  changePCP as changePCPService,
} from '../services/settingsService.js';
import { clearAll } from '../services/localStorageManager.js';
import { initializeMockData } from '../services/mockData.js';

/**
 * @typedef {Object} SettingsContextValue
 * @property {Object|null} accountInfo - The current account information.
 * @property {Array} representatives - The list of authorized representatives.
 * @property {Object|null} privacySettings - The current privacy settings.
 * @property {Array} communicationPrefs - The current communication preferences.
 * @property {Object|null} pcpInfo - The current PCP information.
 * @property {function} updateAccountInfo - Updates account information.
 * @property {function} addRepresentative - Adds a new representative.
 * @property {function} editRepresentative - Edits an existing representative.
 * @property {function} removeRepresentative - Removes a representative.
 * @property {function} updatePrivacySettings - Updates privacy settings.
 * @property {function} updateCommunicationPrefs - Updates communication preferences.
 * @property {function} changePCP - Submits a PCP change request.
 * @property {function} resetAllData - Resets all data to mock defaults.
 * @property {boolean} loading - Whether the settings state is being hydrated.
 */

const SettingsContext = createContext(null);

/**
 * Settings state context provider for all member data domains.
 * Wraps children and provides settings state and actions via React Context.
 * Hydrates all data from settingsService on mount.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function SettingsProvider({ children }) {
  const [accountInfo, setAccountInfo] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [communicationPrefs, setCommunicationPrefs] = useState([]);
  const [pcpInfo, setPcpInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setAccountInfo(getAccountInfo());
      setRepresentatives(getRepresentatives());
      setPrivacySettings(getPrivacySettings());
      setCommunicationPrefs(getCommunicationPreferences());
      setPcpInfo(getPCPInfo());
    } catch {
      // Fall through; state remains at defaults
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Updates the account information.
   *
   * @param {{ name?: string, address?: string, email?: string, phone?: string }} data - The fields to update.
   * @returns {{ success: boolean, accountInfo?: Object, error?: string }}
   */
  const updateAccountInfo = useCallback((data) => {
    const result = updateAccountInfoService(data);
    if (result.success && result.accountInfo) {
      setAccountInfo(result.accountInfo);
    }
    return result;
  }, []);

  /**
   * Adds a new authorized representative.
   *
   * @param {{ name: string, relationship: string, phone: string, email: string }} rep - The representative to add.
   * @returns {{ success: boolean, representatives?: Array, error?: string }}
   */
  const addRepresentative = useCallback((rep) => {
    const result = addRepresentativeService(rep);
    if (result.success && result.representatives) {
      setRepresentatives(result.representatives);
    }
    return result;
  }, []);

  /**
   * Edits an existing authorized representative.
   *
   * @param {string} id - The unique identifier of the representative to edit.
   * @param {{ name?: string, relationship?: string, phone?: string, email?: string }} data - The fields to update.
   * @returns {{ success: boolean, representatives?: Array, error?: string }}
   */
  const editRepresentative = useCallback((id, data) => {
    const result = editRepresentativeService(id, data);
    if (result.success && result.representatives) {
      setRepresentatives(result.representatives);
    }
    return result;
  }, []);

  /**
   * Removes an authorized representative.
   *
   * @param {string} id - The unique identifier of the representative to remove.
   * @returns {{ success: boolean, representatives?: Array, error?: string }}
   */
  const removeRepresentative = useCallback((id) => {
    const result = removeRepresentativeService(id);
    if (result.success && result.representatives) {
      setRepresentatives(result.representatives);
    }
    return result;
  }, []);

  /**
   * Updates the privacy settings.
   *
   * @param {{ shareDataWithProviders?: boolean, allowAnalytics?: boolean, hipaaAcknowledged?: boolean }} data - The privacy settings to update.
   * @returns {{ success: boolean, privacySettings?: Object, error?: string }}
   */
  const updatePrivacySettings = useCallback((data) => {
    const result = updatePrivacySettingsService(data);
    if (result.success && result.privacySettings) {
      setPrivacySettings(result.privacySettings);
    }
    return result;
  }, []);

  /**
   * Updates the communication preferences.
   *
   * @param {Array<{ category: string, channel: string, enabled: boolean }>} data - The updated communication preferences.
   * @returns {{ success: boolean, communicationPreferences?: Array, error?: string }}
   */
  const updateCommunicationPrefs = useCallback((data) => {
    const result = updateCommunicationPreferencesService(data);
    if (result.success && result.communicationPreferences) {
      setCommunicationPrefs(result.communicationPreferences);
    }
    return result;
  }, []);

  /**
   * Submits a PCP change request.
   *
   * @param {{ reason: string, providerName: string, providerPhone?: string, clinic?: string, address?: string }} newPCP - The new PCP details and reason for change.
   * @returns {{ success: boolean, pcpInfo?: Object, confirmation?: string, error?: string }}
   */
  const changePCP = useCallback((newPCP) => {
    const result = changePCPService(newPCP);
    if (result.success && result.pcpInfo) {
      setPcpInfo(result.pcpInfo);
    }
    return result;
  }, []);

  /**
   * Resets all data to mock defaults by clearing localStorage and re-seeding.
   *
   * @returns {void}
   */
  const resetAllData = useCallback(() => {
    clearAll();
    initializeMockData();

    setAccountInfo(getAccountInfo());
    setRepresentatives(getRepresentatives());
    setPrivacySettings(getPrivacySettings());
    setCommunicationPrefs(getCommunicationPreferences());
    setPcpInfo(getPCPInfo());
  }, []);

  const value = {
    accountInfo,
    representatives,
    privacySettings,
    communicationPrefs,
    pcpInfo,
    updateAccountInfo,
    addRepresentative,
    editRepresentative,
    removeRepresentative,
    updatePrivacySettings,
    updateCommunicationPrefs,
    changePCP,
    resetAllData,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the settings context.
 * Must be used within a SettingsProvider.
 *
 * @returns {SettingsContextValue} The settings context value.
 * @throws {Error} If used outside of a SettingsProvider.
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider.');
  }
  return context;
}

export default SettingsContext;