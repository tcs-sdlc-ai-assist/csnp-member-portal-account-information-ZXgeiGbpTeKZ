/**
 * LocalStorage abstraction layer (LocalStorageAdapter).
 * Handles JSON serialization/deserialization, catches errors when
 * localStorage is unavailable (e.g., private browsing), and returns
 * null/false gracefully.
 */

/**
 * Checks whether localStorage is available in the current environment.
 * @returns {boolean} True if localStorage is accessible, false otherwise.
 */
export function isAvailable() {
  try {
    const testKey = '__csnp_storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves a value from localStorage by key and deserializes it from JSON.
 * @param {string} key - The storage key to look up.
 * @returns {*} The deserialized value, or null if the key does not exist,
 *   the value cannot be parsed, or localStorage is unavailable.
 */
export function getItem(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Serializes a value to JSON and stores it in localStorage under the given key.
 * @param {string} key - The storage key.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if the value was stored successfully, false otherwise.
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes a single item from localStorage by key.
 * @param {string} key - The storage key to remove.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears all items from localStorage.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function clearAll() {
  try {
    window.localStorage.clear();
    return true;
  } catch {
    return false;
  }
}