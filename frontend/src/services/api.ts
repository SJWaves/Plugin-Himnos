/**
 * API Service
 * ===========
 * HTTP client for backend API communication.
 */

import { API_BASE_URL, API_ENDPOINTS } from '../shared/constants';
import type { DisplayConfig, HymnDisplay, Hymn, Hymnbook, HymnSearchResult } from '../shared/types';

/**
 * Base fetch wrapper with error handling.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Hymns API
// ============================================================================

/**
 * List all available hymnbooks.
 */
export async function listHymnbooks(): Promise<Record<string, { id: string; name: string; hymn_count: number }>> {
  return fetchApi(`${API_ENDPOINTS.HYMNS}/`);
}

/**
 * Get a specific hymnbook with all hymns.
 */
export async function getHymnbook(hymnbookId: string): Promise<Hymnbook> {
  return fetchApi(`${API_ENDPOINTS.HYMNS}/${hymnbookId}`);
}

/**
 * Search hymns in a hymnbook.
 */
export async function searchHymnsApi(hymnbookId: string, query: string): Promise<HymnSearchResult> {
  return fetchApi(`${API_ENDPOINTS.HYMNS}/${hymnbookId}/search?q=${encodeURIComponent(query)}`);
}

/**
 * Get a specific hymn by number.
 */
export async function getHymn(hymnbookId: string, hymnNumber: number): Promise<Hymn> {
  return fetchApi(`${API_ENDPOINTS.HYMNS}/${hymnbookId}/hymn/${hymnNumber}`);
}

// ============================================================================
// Display API
// ============================================================================

/**
 * Get current display state.
 */
export async function getDisplayState(): Promise<{ is_active: boolean; current_display: HymnDisplay | null }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/state`);
}

/**
 * Show a specific verse.
 */
export async function showVerse(display: HymnDisplay): Promise<{ status: string; message: string }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/show`, {
    method: 'POST',
    body: JSON.stringify(display),
  });
}

/**
 * Show verse by parameters.
 */
export async function showVerseByParams(
  hymnbookId: string,
  hymnNumber: number,
  verseIndex: number
): Promise<{ status: string; message: string; display: HymnDisplay }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/show/${hymnbookId}/${hymnNumber}/${verseIndex}`, {
    method: 'POST',
  });
}

/**
 * Show next verse.
 */
export async function showNextVerse(): Promise<{ status: string; message: string; verse_index?: number; at_end?: boolean }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/next`, { method: 'POST' });
}

/**
 * Show previous verse.
 */
export async function showPreviousVerse(): Promise<{ status: string; message: string; verse_index?: number; at_start?: boolean }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/previous`, { method: 'POST' });
}

/**
 * Clear the display.
 */
export async function clearDisplay(): Promise<{ status: string; message: string }> {
  return fetchApi(`${API_ENDPOINTS.DISPLAY}/clear`, { method: 'POST' });
}

// ============================================================================
// Config API
// ============================================================================

/**
 * Get current display configuration.
 */
export async function getConfig(): Promise<DisplayConfig> {
  return fetchApi(`${API_ENDPOINTS.CONFIG}/`);
}

/**
 * Update display configuration.
 */
export async function updateConfig(config: DisplayConfig): Promise<DisplayConfig> {
  return fetchApi(`${API_ENDPOINTS.CONFIG}/`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

/**
 * Partially update display configuration.
 */
export async function patchConfig(updates: Partial<DisplayConfig>): Promise<DisplayConfig> {
  return fetchApi(`${API_ENDPOINTS.CONFIG}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Reset configuration to defaults.
 */
export async function resetConfig(): Promise<DisplayConfig> {
  return fetchApi(`${API_ENDPOINTS.CONFIG}/reset`, { method: 'POST' });
}
