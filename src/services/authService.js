/**
 * Mock authentication and session management service (AuthService/SessionManager).
 * All operations use LocalStorageManager for persistence.
 * No real authentication is performed; any credentials are accepted.
 *
 * @module authService
 * @see SCRUM-9274
 * @see SCRUM-9279
 */

import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem, removeItem } from './localStorageManager.js';
import { getDefaultAccountInfo } from './mockData.js';

/**
 * Logs in a user with the provided credentials.
 * This is a mock implementation that accepts any email/password combination.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {{ success: boolean, session?: { isAuthenticated: boolean, user: { name: string, email: string, memberId: string }, loginTimestamp: string, expiresAt: string }, error?: string }}
 */
export function login(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const trimmedEmail = String(email).trim();
    const trimmedPassword = String(password).trim();

    if (trimmedEmail.length === 0 || trimmedPassword.length === 0) {
      return { success: false, error: 'Email and password are required.' };
    }

    const accountInfo = getItem(STORAGE_KEYS.ACCOUNT_INFO) || getDefaultAccountInfo();

    const session = {
      isAuthenticated: true,
      user: {
        name: accountInfo.name,
        email: trimmedEmail,
        memberId: accountInfo.memberId,
      },
      loginTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const stored = setItem(STORAGE_KEYS.AUTH_SESSION, session);

    if (!stored) {
      return { success: false, error: 'Failed to persist session. localStorage may be unavailable.' };
    }

    return { success: true, session };
  } catch {
    return { success: false, error: 'An unexpected error occurred during login.' };
  }
}

/**
 * Signs up a new user with the provided details.
 * This is a mock implementation that accepts any input and creates a session.
 *
 * @param {string} name - The user's full name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @returns {{ success: boolean, session?: { isAuthenticated: boolean, user: { name: string, email: string, memberId: string }, loginTimestamp: string, expiresAt: string }, error?: string }}
 */
export function signup(name, email, password) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim();
    const trimmedPassword = String(password).trim();

    if (trimmedName.length === 0 || trimmedEmail.length === 0 || trimmedPassword.length === 0) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    const defaultAccount = getDefaultAccountInfo();
    const memberId = defaultAccount.memberId;

    const session = {
      isAuthenticated: true,
      user: {
        name: trimmedName,
        email: trimmedEmail,
        memberId,
      },
      loginTimestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const storedSession = setItem(STORAGE_KEYS.AUTH_SESSION, session);

    if (!storedSession) {
      return { success: false, error: 'Failed to persist session. localStorage may be unavailable.' };
    }

    // Update account info with the new user's details
    const updatedAccountInfo = {
      ...defaultAccount,
      name: trimmedName,
      email: trimmedEmail,
    };

    setItem(STORAGE_KEYS.ACCOUNT_INFO, updatedAccountInfo);

    return { success: true, session };
  } catch {
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Logs out the current user by clearing the session from localStorage.
 *
 * @returns {void}
 */
export function logout() {
  removeItem(STORAGE_KEYS.AUTH_SESSION);
}

/**
 * Retrieves the current session from localStorage.
 *
 * @returns {{ isAuthenticated: boolean, user: { name: string, email: string, memberId: string }, loginTimestamp: string, expiresAt: string } | null}
 *   The current session object, or null if no session exists or it has expired.
 */
export function getSession() {
  try {
    const session = getItem(STORAGE_KEYS.AUTH_SESSION);

    if (!session) {
      return null;
    }

    if (!session.isAuthenticated) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt) {
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt <= new Date()) {
        removeItem(STORAGE_KEYS.AUTH_SESSION);
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}