import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isAvailable, getItem, setItem, removeItem, clearAll } from './localStorageManager.js';

describe('localStorageManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('isAvailable', () => {
    it('returns true when localStorage is accessible', () => {
      expect(isAvailable()).toBe(true);
    });

    it('returns false when localStorage throws an error', () => {
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = () => {
        throw new Error('localStorage is not available');
      };

      expect(isAvailable()).toBe(false);

      window.localStorage.setItem = originalSetItem;
    });
  });

  describe('getItem', () => {
    it('returns null for a non-existent key', () => {
      expect(getItem('nonexistent_key')).toBeNull();
    });

    it('returns the deserialized value for an existing key', () => {
      window.localStorage.setItem('test_key', JSON.stringify({ foo: 'bar' }));
      expect(getItem('test_key')).toEqual({ foo: 'bar' });
    });

    it('returns null when the stored value is invalid JSON', () => {
      window.localStorage.setItem('bad_json', '{not valid json!!!');
      expect(getItem('bad_json')).toBeNull();
    });

    it('handles string values correctly', () => {
      window.localStorage.setItem('str_key', JSON.stringify('hello'));
      expect(getItem('str_key')).toBe('hello');
    });

    it('handles numeric values correctly', () => {
      window.localStorage.setItem('num_key', JSON.stringify(42));
      expect(getItem('num_key')).toBe(42);
    });

    it('handles array values correctly', () => {
      window.localStorage.setItem('arr_key', JSON.stringify([1, 2, 3]));
      expect(getItem('arr_key')).toEqual([1, 2, 3]);
    });

    it('handles boolean values correctly', () => {
      window.localStorage.setItem('bool_key', JSON.stringify(true));
      expect(getItem('bool_key')).toBe(true);
    });

    it('returns null when localStorage.getItem throws', () => {
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = () => {
        throw new Error('Storage error');
      };

      expect(getItem('any_key')).toBeNull();

      window.localStorage.getItem = originalGetItem;
    });
  });

  describe('setItem', () => {
    it('stores a value and returns true on success', () => {
      const result = setItem('test_key', { name: 'Jane' });
      expect(result).toBe(true);

      const raw = window.localStorage.getItem('test_key');
      expect(JSON.parse(raw)).toEqual({ name: 'Jane' });
    });

    it('stores a string value correctly', () => {
      const result = setItem('str_key', 'hello world');
      expect(result).toBe(true);
      expect(JSON.parse(window.localStorage.getItem('str_key'))).toBe('hello world');
    });

    it('stores an array value correctly', () => {
      const result = setItem('arr_key', [1, 'two', 3]);
      expect(result).toBe(true);
      expect(JSON.parse(window.localStorage.getItem('arr_key'))).toEqual([1, 'two', 3]);
    });

    it('returns false when localStorage.setItem throws', () => {
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      const result = setItem('fail_key', 'value');
      expect(result).toBe(false);

      window.localStorage.setItem = originalSetItem;
    });

    it('overwrites an existing value', () => {
      setItem('overwrite_key', 'first');
      setItem('overwrite_key', 'second');
      expect(getItem('overwrite_key')).toBe('second');
    });
  });

  describe('getItem/setItem round-trip', () => {
    it('round-trips an object correctly', () => {
      const data = { name: 'Jane Doe', age: 30, active: true };
      setItem('round_trip', data);
      expect(getItem('round_trip')).toEqual(data);
    });

    it('round-trips a nested object correctly', () => {
      const data = {
        user: { name: 'Jane', preferences: { theme: 'dark' } },
        items: [1, 2, 3],
      };
      setItem('nested_trip', data);
      expect(getItem('nested_trip')).toEqual(data);
    });

    it('round-trips null value correctly', () => {
      setItem('null_key', null);
      expect(getItem('null_key')).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('removes an existing item and returns true', () => {
      setItem('remove_me', 'value');
      expect(getItem('remove_me')).toBe('value');

      const result = removeItem('remove_me');
      expect(result).toBe(true);
      expect(getItem('remove_me')).toBeNull();
    });

    it('returns true even when the key does not exist', () => {
      const result = removeItem('nonexistent_key');
      expect(result).toBe(true);
    });

    it('returns false when localStorage.removeItem throws', () => {
      const originalRemoveItem = window.localStorage.removeItem;
      window.localStorage.removeItem = () => {
        throw new Error('Storage error');
      };

      const result = removeItem('any_key');
      expect(result).toBe(false);

      window.localStorage.removeItem = originalRemoveItem;
    });

    it('does not affect other stored items', () => {
      setItem('keep_me', 'stay');
      setItem('remove_me', 'go');

      removeItem('remove_me');

      expect(getItem('keep_me')).toBe('stay');
      expect(getItem('remove_me')).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('removes all items from localStorage and returns true', () => {
      setItem('key1', 'value1');
      setItem('key2', 'value2');
      setItem('key3', 'value3');

      const result = clearAll();
      expect(result).toBe(true);

      expect(getItem('key1')).toBeNull();
      expect(getItem('key2')).toBeNull();
      expect(getItem('key3')).toBeNull();
      expect(window.localStorage.length).toBe(0);
    });

    it('returns true when localStorage is already empty', () => {
      const result = clearAll();
      expect(result).toBe(true);
    });

    it('returns false when localStorage.clear throws', () => {
      const originalClear = window.localStorage.clear;
      window.localStorage.clear = () => {
        throw new Error('Storage error');
      };

      const result = clearAll();
      expect(result).toBe(false);

      window.localStorage.clear = originalClear;
    });
  });
});