/**
 * Broadcast Service
 * =================
 * Handles real-time communication between control panel and display.
 * Uses BroadcastChannel API with localStorage fallback.
 */

import { DisplayConfig, HymnDisplay, DEFAULT_CONFIG } from '../shared/types';
import { STORAGE_KEYS, BROADCAST_CHANNEL } from '../shared/constants';
import { safeGetItem, safeSetItem, safeRemoveItem, safeJsonParse } from '../shared/utils';

type ChannelMessage = {
  type: 'display' | 'config';
  data: unknown;
};

/**
 * Broadcaster class for sending and receiving hymn display updates.
 */
export class HymnBroadcaster {
  private channel: BroadcastChannel | null = null;
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private onMessageCallback: ((message: ChannelMessage) => void) | null = null;
  private readonly senderId: string;

  constructor() {
    this.senderId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sender_${Math.random().toString(16).slice(2)}`;

    if (typeof window === 'undefined') return;

    // Try to use BroadcastChannel first
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL);
        return;
      } catch (error) {
        console.warn('[Broadcast] BroadcastChannel not available, using fallback:', error);
        this.channel = null;
      }
    }
  }

  /**
   * Send display update to all listeners.
   */
  sendDisplay(display: HymnDisplay | null): void {
    this.postMessage({ type: 'display', data: display });
    
    if (display) {
      safeSetItem(STORAGE_KEYS.CURRENT_DISPLAY, JSON.stringify(display));
    } else {
      safeRemoveItem(STORAGE_KEYS.CURRENT_DISPLAY);
    }
  }

  /**
   * Send config update to all listeners.
   */
  sendConfig(config: DisplayConfig): void {
    this.postMessage({ type: 'config', data: config });
    safeSetItem(STORAGE_KEYS.DISPLAY_CONFIG, JSON.stringify(config));
  }

  /**
   * Clear the display.
   */
  clearDisplay(): void {
    this.sendDisplay(null);
  }

  /**
   * Register a callback for incoming messages.
   */
  onMessage(callback: (message: ChannelMessage) => void): void {
    this.onMessageCallback = callback;

    if (this.channel) {
      this.channel.onmessage = (event) => callback(event.data);
      return;
    }

    // Fallback: Listen for storage events
    this.storageListener = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEYS.BROADCAST_FALLBACK || !event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.senderId === this.senderId) return;
        callback(parsed.message);
      } catch (error) {
        console.warn('[Broadcast] Error parsing storage event:', error);
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  /**
   * Close the broadcaster and clean up.
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }

  private postMessage(message: ChannelMessage): void {
    if (this.channel) {
      this.channel.postMessage(message);
      return;
    }

    // Fallback: Use localStorage
    safeSetItem(
      STORAGE_KEYS.BROADCAST_FALLBACK,
      JSON.stringify({
        senderId: this.senderId,
        ts: Date.now(),
        message,
      })
    );

    // Loopback for same tab
    this.onMessageCallback?.(message);
  }
}

/**
 * Get stored display configuration.
 */
export function getStoredConfig(): DisplayConfig {
  const stored = safeGetItem(STORAGE_KEYS.DISPLAY_CONFIG);
  return safeJsonParse(stored, DEFAULT_CONFIG);
}

/**
 * Get current display from storage.
 */
export function getCurrentDisplay(): HymnDisplay | null {
  const stored = safeGetItem(STORAGE_KEYS.CURRENT_DISPLAY);
  return safeJsonParse(stored, null);
}

// Export types for backwards compatibility
export type { DisplayConfig, HymnDisplay };
export { DEFAULT_CONFIG };
