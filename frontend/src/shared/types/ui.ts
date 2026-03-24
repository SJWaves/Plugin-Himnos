/**
 * UI Settings type definitions.
 */

export type SectionHeaderPlacement = 'pinned' | 'flow' | 'sticky';
export type SectionHeaderDensity = 'compact' | 'normal' | 'comfortable';
export type SectionHeaderVariant = 'full' | 'mini';

/**
 * UI Settings for the control panel.
 */
export interface UISettings {
  fontScale: number;
  iconScale: number;
  headerHeight: number;
  accentColor: string;
  showHeader: boolean;
  showBottomNav: boolean;
  panelMaxWidthPx: number;
  sectionHeadersVisible: boolean;
  sectionHeaderPlacement: SectionHeaderPlacement;
  sectionHeaderDensity: SectionHeaderDensity;
  sectionHeaderVariant: SectionHeaderVariant;

  // Glass tuning
  glassPanelA1: number;
  glassPanelA2: number;
  glassPanelBlurPx: number;
  glassPanelBorderAlpha: number;
  glassPanelRadiusRem: number;
  glassSubtleA: number;
  glassSubtleBlurPx: number;
  glassSubtleBorderAlpha: number;
  glassSubtleRadiusRem: number;

  // Verse styles (idle/focused/active)
  verseIdleBg: string;
  verseIdleBgAlpha: number;
  verseIdleBorder: string;
  verseIdleBorderAlpha: number;
  verseFocusedBg: string;
  verseFocusedBgAlpha: number;
  verseFocusedBorder: string;
  verseFocusedBorderAlpha: number;
  verseActiveBg: string;
  verseActiveBgAlpha: number;
  verseActiveBorder: string;
  verseActiveBorderAlpha: number;
}

/**
 * Default UI settings values.
 */
export const DEFAULT_UI_SETTINGS: UISettings = {
  fontScale: 1,
  iconScale: 1,
  headerHeight: 64,
  accentColor: '#C5A021',
  showHeader: true,
  showBottomNav: true,
  panelMaxWidthPx: 0,
  sectionHeadersVisible: true,
  sectionHeaderPlacement: 'pinned',
  sectionHeaderDensity: 'normal',
  sectionHeaderVariant: 'full',

  glassPanelA1: 0.5,
  glassPanelA2: 0.3,
  glassPanelBlurPx: 15,
  glassPanelBorderAlpha: 0.2,
  glassPanelRadiusRem: 1.5,
  glassSubtleA: 0.25,
  glassSubtleBlurPx: 8,
  glassSubtleBorderAlpha: 0.15,
  glassSubtleRadiusRem: 0.875,

  verseIdleBg: '#000000',
  verseIdleBgAlpha: 0.35,
  verseIdleBorder: '#FFFFFF',
  verseIdleBorderAlpha: 0.08,
  verseFocusedBg: '#FFFFFF',
  verseFocusedBgAlpha: 0.06,
  verseFocusedBorder: '#FFFFFF',
  verseFocusedBorderAlpha: 0.35,
  verseActiveBg: '#FFFFFF',
  verseActiveBgAlpha: 0.10,
  verseActiveBorder: '#FFFFFF',
  verseActiveBorderAlpha: 1,
};
