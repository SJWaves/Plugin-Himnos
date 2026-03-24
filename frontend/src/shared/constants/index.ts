/**
 * Application constants.
 */

// Storage keys
export const STORAGE_KEYS = {
  DISPLAY_CONFIG: 'obs-hymn-config',
  CURRENT_DISPLAY: 'obs-hymn-current-display',
  SAVED_HYMNS: 'obs-saved-hymns',
  UI_SETTINGS: 'obs-ui-settings',
  BROADCAST_FALLBACK: 'obs-hymn-broadcast-fallback',
} as const;

// Broadcast channel name
export const BROADCAST_CHANNEL = 'obs-hymn-display';

// API endpoints (when using backend)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  HYMNS: '/api/hymns',
  DISPLAY: '/api/display',
  CONFIG: '/api/config',
  WEBSOCKET_DISPLAY: '/ws/display',
  WEBSOCKET_CONTROL: '/ws/control',
} as const;

// Default hymnbook ID
export const DEFAULT_HYMNBOOK_ID = 'celebremos_su_gloria';

// Re-export templates
export * from './templates';
