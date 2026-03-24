/**
 * Storage utility functions.
 */

/**
 * Safely get item from localStorage.
 */
export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('[Storage] getItem failed:', error);
    return null;
  }
}

/**
 * Safely set item in localStorage.
 */
export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('[Storage] setItem failed:', error);
  }
}

/**
 * Safely remove item from localStorage.
 */
export function safeRemoveItem(key: string): void {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn('[Storage] removeItem failed:', error);
  }
}

/**
 * Parse JSON safely with fallback.
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
