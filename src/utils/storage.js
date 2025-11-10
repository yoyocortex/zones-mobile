import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper with localStorage-like API
 * Handles JSON serialization/deserialization automatically
 */

/**
 * Save data (auto-stringifies JSON)
 */
export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`[Storage] Error saving ${key}:`, error);
    throw error;
  }
};

/**
 * Load data (auto-parses JSON)
 * @returns {any|null} Parsed value or null if not found
 */
export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`[Storage] Error loading ${key}:`, error);
    return null; // Fail gracefully
  }
};

/**
 * Remove single key
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all storage (use with caution)
 */
export const clear = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
    throw error;
  }
};
