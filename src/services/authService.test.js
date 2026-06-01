import { describe, it, expect, beforeEach } from 'vitest';
import { login, signup, logout, getSession } from './authService.js';
import { STORAGE_KEYS } from '../constants.js';
import { getItem, setItem } from './localStorageManager.js';
import { initializeMockData } from './mockData.js';

describe('authService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    initializeMockData();
  });

  describe('login', () => {
    it('creates a session and persists it to localStorage with any credentials', () => {
      const result = login('test@example.com', 'anypassword');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.isAuthenticated).toBe(true);
      expect(result.session.user.email).toBe('test@example.com');
      expect(result.session.user.memberId).toBe('M1234567');
      expect(result.session.loginTimestamp).toBeDefined();
      expect(result.session.expiresAt).toBeDefined();

      const storedSession = getItem(STORAGE_KEYS.AUTH_SESSION);
      expect(storedSession).not.toBeNull();
      expect(storedSession.isAuthenticated).toBe(true);
      expect(storedSession.user.email).toBe('test@example.com');
    });

    it('accepts any email and password combination', () => {
      const result1 = login('foo@bar.com', 'password123');
      expect(result1.success).toBe(true);

      window.localStorage.clear();
      initializeMockData();

      const result2 = login('another@user.org', 'differentpass');
      expect(result2.success).toBe(true);
    });

    it('trims email and password before processing', () => {
      const result = login('  spaced@email.com  ', '  pass  ');

      expect(result.success).toBe(true);
      expect(result.session.user.email).toBe('spaced@email.com');
    });

    it('returns error when email is empty', () => {
      const result = login('', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required.');
    });

    it('returns error when password is empty', () => {
      const result = login('test@example.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required.');
    });

    it('returns error when email is null', () => {
      const result = login(null, 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required.');
    });

    it('returns error when password is null', () => {
      const result = login('test@example.com', null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required.');
    });

    it('returns error when both email and password are empty strings', () => {
      const result = login('   ', '   ');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required.');
    });

    it('sets session expiration to 24 hours from now', () => {
      const before = Date.now();
      const result = login('test@example.com', 'password');
      const after = Date.now();

      expect(result.success).toBe(true);

      const expiresAt = new Date(result.session.expiresAt).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + oneDayMs);
      expect(expiresAt).toBeLessThanOrEqual(after + oneDayMs);
    });

    it('uses account info name from localStorage for session user name', () => {
      const result = login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.session.user.name).toBe('Jane Doe');
    });
  });

  describe('signup', () => {
    it('creates a session with the provided name and email', () => {
      const result = signup('New User', 'new@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.isAuthenticated).toBe(true);
      expect(result.session.user.name).toBe('New User');
      expect(result.session.user.email).toBe('new@example.com');
      expect(result.session.user.memberId).toBe('M1234567');
    });

    it('persists session to localStorage', () => {
      signup('New User', 'new@example.com', 'password123');

      const storedSession = getItem(STORAGE_KEYS.AUTH_SESSION);
      expect(storedSession).not.toBeNull();
      expect(storedSession.isAuthenticated).toBe(true);
      expect(storedSession.user.name).toBe('New User');
    });

    it('updates account info with the new user details', () => {
      signup('New User', 'new@example.com', 'password123');

      const accountInfo = getItem(STORAGE_KEYS.ACCOUNT_INFO);
      expect(accountInfo.name).toBe('New User');
      expect(accountInfo.email).toBe('new@example.com');
    });

    it('returns error when name is empty', () => {
      const result = signup('', 'new@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, email, and password are required.');
    });

    it('returns error when email is empty', () => {
      const result = signup('New User', '', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, email, and password are required.');
    });

    it('returns error when password is empty', () => {
      const result = signup('New User', 'new@example.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, email, and password are required.');
    });

    it('returns error when all fields are null', () => {
      const result = signup(null, null, null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, email, and password are required.');
    });

    it('trims whitespace from name, email, and password', () => {
      const result = signup('  New User  ', '  new@example.com  ', '  pass  ');

      expect(result.success).toBe(true);
      expect(result.session.user.name).toBe('New User');
      expect(result.session.user.email).toBe('new@example.com');
    });

    it('returns error when fields are only whitespace', () => {
      const result = signup('   ', '   ', '   ');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, email, and password are required.');
    });
  });

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      login('test@example.com', 'password');

      const sessionBefore = getItem(STORAGE_KEYS.AUTH_SESSION);
      expect(sessionBefore).not.toBeNull();

      logout();

      const sessionAfter = getItem(STORAGE_KEYS.AUTH_SESSION);
      expect(sessionAfter).toBeNull();
    });

    it('does not throw when no session exists', () => {
      window.localStorage.clear();

      expect(() => logout()).not.toThrow();
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists in localStorage', () => {
      window.localStorage.clear();

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns the session after a successful login', () => {
      login('test@example.com', 'password');

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.isAuthenticated).toBe(true);
      expect(session.user.email).toBe('test@example.com');
    });

    it('returns the session after a successful signup', () => {
      signup('New User', 'new@example.com', 'password');

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.isAuthenticated).toBe(true);
      expect(session.user.name).toBe('New User');
    });

    it('returns null after logout', () => {
      login('test@example.com', 'password');
      logout();

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session isAuthenticated is false', () => {
      setItem(STORAGE_KEYS.AUTH_SESSION, {
        isAuthenticated: false,
        user: { name: 'Test', email: 'test@test.com', memberId: 'M123' },
        loginTimestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session has expired', () => {
      setItem(STORAGE_KEYS.AUTH_SESSION, {
        isAuthenticated: true,
        user: { name: 'Test', email: 'test@test.com', memberId: 'M123' },
        loginTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });

      const session = getSession();
      expect(session).toBeNull();
    });

    it('removes expired session from localStorage', () => {
      setItem(STORAGE_KEYS.AUTH_SESSION, {
        isAuthenticated: true,
        user: { name: 'Test', email: 'test@test.com', memberId: 'M123' },
        loginTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });

      getSession();

      const storedSession = getItem(STORAGE_KEYS.AUTH_SESSION);
      expect(storedSession).toBeNull();
    });

    it('returns valid session when it has not expired', () => {
      setItem(STORAGE_KEYS.AUTH_SESSION, {
        isAuthenticated: true,
        user: { name: 'Test', email: 'test@test.com', memberId: 'M123' },
        loginTimestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.isAuthenticated).toBe(true);
      expect(session.user.name).toBe('Test');
    });
  });
});