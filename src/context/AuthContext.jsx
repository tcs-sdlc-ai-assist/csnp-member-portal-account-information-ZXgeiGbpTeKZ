import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { login as authLogin, signup as authSignup, logout as authLogout, getSession } from '../services/authService.js';

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} session - The current session object or null if not authenticated.
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated.
 * @property {function} login - Logs in a user with email and password.
 * @property {function} signup - Signs up a new user with name, email, and password.
 * @property {function} logout - Logs out the current user.
 * @property {boolean} loading - Whether the auth state is being hydrated.
 */

const AuthContext = createContext(null);

/**
 * Authentication state context provider.
 * Wraps children and provides authentication state and actions via React Context.
 * Hydrates session from localStorage on mount via authService.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const existingSession = getSession();
      if (existingSession) {
        setSession(existingSession);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs in a user with the provided credentials.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {{ success: boolean, session?: Object, error?: string }}
   */
  const login = useCallback((email, password) => {
    const result = authLogin(email, password);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  }, []);

  /**
   * Signs up a new user with the provided details.
   *
   * @param {string} name - The user's full name.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's chosen password.
   * @returns {{ success: boolean, session?: Object, error?: string }}
   */
  const signup = useCallback((name, email, password) => {
    const result = authSignup(name, email, password);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  }, []);

  /**
   * Logs out the current user by clearing the session.
   *
   * @returns {void}
   */
  const logout = useCallback(() => {
    authLogout();
    setSession(null);
  }, []);

  const isAuthenticated = session !== null && session.isAuthenticated === true;

  const value = {
    session,
    isAuthenticated,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

export default AuthContext;