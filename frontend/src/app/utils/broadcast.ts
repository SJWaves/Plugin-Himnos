// Utilidad para comunicación entre el panel de control y el display.
// Usa BroadcastChannel cuando está disponible y cae a un fallback por localStorage
// para entornos (p. ej. algunos docks/browsers embebidos) donde BroadcastChannel no existe.

export interface DisplayConfig {
  // Texto del himno
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  normalizeLineBreaks: boolean;
  
  // Título del himno
  showTitle: boolean;
  titleFontSize: number;
  titleColor: string;
  
  // Panel/Contenedor
  showPanel: boolean;
  panelBackground: string;
  panelOpacity: number;
  panelBorderColor: string;
  panelBlur: number;
  
  // Posicionamiento
  position: 'top' | 'middle' | 'bottom';
  horizontalAlignment: 'left' | 'center' | 'right';
  verticalOffset: number;
  horizontalOffset: number;
  maxWidth: number;
  
  // Espaciado
  padding: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  
  // Efecto de fondo (solo visual, no afecta transparencia)
  showBackgroundGradient: boolean;
  
  // Fondo de página (para Display/OBS)
  pageBackgroundColor: string;
  pageBackgroundOpacity: number;
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
  // Texto del himno
  fontSize: 48,
  fontFamily: 'Arial, sans-serif',
  textColor: '#FFFFFF',
  textAlign: 'center',
  textShadow: true,
  normalizeLineBreaks: false,
  
  // Título del himno
  showTitle: true,
  titleFontSize: 28,
  titleColor: '#C5A021',
  
  // Panel/Contenedor
  showPanel: false,
  panelBackground: '#000000',
  panelOpacity: 0.3,
  panelBorderColor: '#C5A021',
  panelBlur: 16,
  
  // Posicionamiento
  position: 'bottom',
  horizontalAlignment: 'center',
  verticalOffset: 0,
  horizontalOffset: 0,
  maxWidth: 9999,
  
  // Espaciado
  padding: 20,
  marginTop: 0,
  marginBottom: 40,
  marginLeft: 40,
  marginRight: 40,
  
  // Efecto de fondo
  showBackgroundGradient: false,
  
  // Fondo de página (transparente por defecto para OBS)
  pageBackgroundColor: '#000000',
  pageBackgroundOpacity: 0,
};

// ── Projection config ──────────────────────────────────────────────────────────

export type ProjectionBackgroundCategory = 'nature' | 'sky' | 'light' | 'peaceful' | 'spiritual' | 'all';
export type ProjectionBackgroundMode = 'random' | 'cycle' | 'fixed';

export interface ProjectionConfig {
  // General
  enabled: boolean;

  // Text
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  showTitle: boolean;
  titleFontSize: number;
  titleColor: string;

  // Panel
  showPanel: boolean;
  panelBackground: string;
  panelOpacity: number;
  panelBlur: number;

  // Layout
  position: 'top' | 'middle' | 'bottom';
  maxWidth: number;
  padding: number;
  marginBottom: number;
  marginTop: number;

  // Background
  showBackground: boolean;
  backgroundCategory: ProjectionBackgroundCategory;
  backgroundMode: ProjectionBackgroundMode;
  backgroundIndex: number;
  backgroundChangeOnHymn: boolean;
  backgroundOverlayOpacity: number;
}

export const DEFAULT_PROJECTION_CONFIG: ProjectionConfig = {
  enabled: true,
  fontSize: 52,
  fontFamily: 'Georgia, serif',
  textColor: '#FFFFFF',
  textAlign: 'center',
  textShadow: true,
  showTitle: true,
  titleFontSize: 28,
  titleColor: '#F5C842',
  showPanel: true,
  panelBackground: '#000000',
  panelOpacity: 0.45,
  panelBlur: 16,
  position: 'bottom',
  maxWidth: 960,
  padding: 32,
  marginBottom: 60,
  marginTop: 60,
  showBackground: true,
  backgroundCategory: 'spiritual',
  backgroundMode: 'random',
  backgroundIndex: 0,
  backgroundChangeOnHymn: true,
  backgroundOverlayOpacity: 0.35,
};

// ── Channel / storage keys ─────────────────────────────────────────────────────

const CHANNEL_NAME = 'obs-hymn-display';
const STORAGE_KEY = 'obs-hymn-current-display';
const CONFIG_KEY = 'obs-hymn-config';
const PROJECTION_CONFIG_KEY = 'obs-projection-config';
const FALLBACK_BROADCAST_KEY = 'obs-hymn-broadcast-fallback';

type ChannelMessage = { type: 'display' | 'config' | 'projection-config'; data: unknown };

function safeLocalStorageSetItem(key: string, value: string) {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('[broadcast] localStorage.setItem falló:', error);
  }
}

function safeLocalStorageGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('[broadcast] localStorage.getItem falló:', error);
    return null;
  }
}

function safeLocalStorageRemoveItem(key: string) {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn('[broadcast] localStorage.removeItem falló:', error);
  }
}

export class HymnBroadcaster {
  private channel: BroadcastChannel | null = null;
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private readonly senderId: string;

  constructor() {
    this.senderId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sender_${Math.random().toString(16).slice(2)}`;

    if (typeof window === 'undefined') return;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        return;
      } catch (error) {
        console.warn('[broadcast] BroadcastChannel no disponible, usando fallback:', error);
        this.channel = null;
      }
    }

    // Fallback: broadcast por localStorage + evento "storage".
    // Nota: el evento "storage" NO se dispara en la misma pestaña, por eso
    // hacemos también un "loopback" al callback si existe.
  }

  sendDisplay(display: HymnDisplay | null) {
    this.postMessage({ type: 'display', data: display } satisfies ChannelMessage);
    // También guardamos en localStorage como respaldo
    if (display) {
      safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(display));
    } else {
      safeLocalStorageRemoveItem(STORAGE_KEY);
    }
  }

  sendConfig(config: DisplayConfig) {
    this.postMessage({ type: 'config', data: config } satisfies ChannelMessage);
    safeLocalStorageSetItem(CONFIG_KEY, JSON.stringify(config));
  }

  sendProjectionConfig(config: ProjectionConfig) {
    this.postMessage({ type: 'projection-config', data: config } satisfies ChannelMessage);
    safeLocalStorageSetItem(PROJECTION_CONFIG_KEY, JSON.stringify(config));
  }

  clearDisplay() {
    this.sendDisplay(null);
  }

  private postMessage(message: ChannelMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
      return;
    }

    // Fallback por localStorage
    safeLocalStorageSetItem(
      FALLBACK_BROADCAST_KEY,
      JSON.stringify({
        senderId: this.senderId,
        ts: Date.now(),
        message,
      }),
    );

    // Loopback (misma pestaña)
    this.onMessageCallback?.(message);
  }

  onMessage(callback: (message: any) => void) {
    this.onMessageCallback = callback;

    if (this.channel) {
      this.channel.onmessage = (event) => callback(event.data);
      return;
    }

    if (typeof window === 'undefined') return;
    if (this.storageListener) return;

    this.storageListener = (event: StorageEvent) => {
      if (event.key !== FALLBACK_BROADCAST_KEY) return;
      if (!event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as {
          senderId?: string;
          ts?: number;
          message?: ChannelMessage;
        };
        if (!parsed?.message) return;
        if (parsed.senderId && parsed.senderId === this.senderId) return;
        callback(parsed.message);
      } catch (error) {
        console.warn('[broadcast] fallo al parsear mensaje fallback:', error);
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (typeof window !== 'undefined' && this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  }
}

export function getCurrentDisplay(): HymnDisplay | null {
  const stored = safeLocalStorageGetItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getStoredConfig(): DisplayConfig {
  const stored = safeLocalStorageGetItem(CONFIG_KEY);
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function getStoredProjectionConfig(): ProjectionConfig {
  const stored = safeLocalStorageGetItem(PROJECTION_CONFIG_KEY);
  if (!stored) return DEFAULT_PROJECTION_CONFIG;
  try {
    return { ...DEFAULT_PROJECTION_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PROJECTION_CONFIG;
  }
}
