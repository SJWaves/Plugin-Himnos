/**
 * Type definitions for display configuration and state.
 */

export type TextAlign = 'left' | 'center' | 'right';
export type Position = 'top' | 'middle' | 'bottom';

/**
 * Display configuration for OBS overlay.
 */
export interface DisplayConfig {
  // Text settings
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: TextAlign;
  textShadow: boolean;
  normalizeLineBreaks: boolean;

  // Title settings
  showTitle: boolean;
  titleFontSize: number;
  titleColor: string;

  // Panel settings
  showPanel: boolean;
  panelBackground: string;
  panelOpacity: number;
  panelBorderColor: string;
  panelBlur: number;

  // Position settings
  position: Position;
  horizontalAlignment: TextAlign;
  verticalOffset: number;
  horizontalOffset: number;
  maxWidth: number;

  // Spacing
  padding: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;

  // Background effect
  showBackgroundGradient: boolean;
}

/**
 * Current display state for OBS.
 */
export interface HymnDisplay {
  hymnbookId: string;
  hymnNumber: number;
  hymnTitle: string;
  verseIndex: number;
  verseText: string;
  config: DisplayConfig;
}

/**
 * Default display configuration values.
 */
export const DEFAULT_CONFIG: DisplayConfig = {
  // Text settings
  fontSize: 48,
  fontFamily: 'Arial, sans-serif',
  textColor: '#FFFFFF',
  textAlign: 'center',
  textShadow: true,
  normalizeLineBreaks: false,

  // Title settings
  showTitle: true,
  titleFontSize: 28,
  titleColor: '#C5A021',

  // Panel settings
  showPanel: false,
  panelBackground: '#000000',
  panelOpacity: 0.3,
  panelBorderColor: '#C5A021',
  panelBlur: 16,

  // Position settings
  position: 'bottom',
  horizontalAlignment: 'center',
  verticalOffset: 0,
  horizontalOffset: 0,
  maxWidth: 1000,

  // Spacing
  padding: 20,
  marginTop: 0,
  marginBottom: 40,
  marginLeft: 40,
  marginRight: 40,

  // Background effect
  showBackgroundGradient: false,
};
