// Utilidad para comunicación entre el panel de control y el display usando BroadcastChannel API

export interface DisplayConfig {
  // Texto del himno
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  
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
  maxWidth: 1000,
  
  // Espaciado
  padding: 20,
  marginTop: 0,
  marginBottom: 40,
  marginLeft: 40,
  marginRight: 40,
  
  // Efecto de fondo
  showBackgroundGradient: false,
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
