// Utilidad para comunicación entre el panel de control y el display usando BroadcastChannel API

export interface DisplayConfig {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  position: 'top' | 'middle' | 'bottom';
  textShadow: boolean;
  padding: number;
  showGlassPanel: boolean;
  backgroundOpacity: number;
  screenBackgroundColor: string;
}

export interface HymnDisplay {
  hymnbookId: string;
  hymnNumber: number;
  hymnTitle: string;
  verseIndex: number;
  verseText: string;
  config: DisplayConfig;
}

export const DEFAULT_CONFIG: DisplayConfig = {
  fontSize: 48,
  fontFamily: 'Arial, sans-serif',
  textColor: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  textAlign: 'center',
  position: 'bottom',
  textShadow: true,
  padding: 40,
  showGlassPanel: true,
  backgroundOpacity: 0,
  screenBackgroundColor: '#000000',
};

const CHANNEL_NAME = 'obs-hymn-display';
const STORAGE_KEY = 'obs-hymn-current-display';
const CONFIG_KEY = 'obs-hymn-config';

export class HymnBroadcaster {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
  }

  sendDisplay(display: HymnDisplay | null) {
    this.channel.postMessage({ type: 'display', data: display });
    // También guardamos en localStorage como respaldo
    if (display) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(display));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  sendConfig(config: DisplayConfig) {
    this.channel.postMessage({ type: 'config', data: config });
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  clearDisplay() {
    this.sendDisplay(null);
  }

  onMessage(callback: (message: any) => void) {
    this.channel.onmessage = (event) => callback(event.data);
  }

  close() {
    this.channel.close();
  }
}

export function getCurrentDisplay(): HymnDisplay | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getStoredConfig(): DisplayConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}
