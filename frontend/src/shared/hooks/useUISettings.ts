/**
 * Custom hooks for UI settings.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UISettings } from '../types';
import { DEFAULT_UI_SETTINGS } from '../types';
import { safeGetItem, safeSetItem, safeJsonParse, hexToRgb, clamp } from '../utils';
import { STORAGE_KEYS } from '../constants';

/**
 * Parse and validate UI settings.
 */
function parseUISettings(raw: unknown): UISettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_UI_SETTINGS;
  const candidate = raw as Partial<UISettings>;

  return {
    fontScale: clamp(Number(candidate.fontScale ?? DEFAULT_UI_SETTINGS.fontScale), 0.8, 1.6),
    iconScale: clamp(Number(candidate.iconScale ?? DEFAULT_UI_SETTINGS.iconScale), 0.75, 1.8),
    headerHeight: clamp(Number(candidate.headerHeight ?? DEFAULT_UI_SETTINGS.headerHeight), 44, 140),
    accentColor:
      typeof candidate.accentColor === 'string' && hexToRgb(candidate.accentColor)
        ? candidate.accentColor
        : DEFAULT_UI_SETTINGS.accentColor,
    showHeader:
      typeof candidate.showHeader === 'boolean' ? candidate.showHeader : DEFAULT_UI_SETTINGS.showHeader,
    showBottomNav:
      typeof candidate.showBottomNav === 'boolean' ? candidate.showBottomNav : DEFAULT_UI_SETTINGS.showBottomNav,
    panelMaxWidthPx: clamp(
      Number(candidate.panelMaxWidthPx ?? DEFAULT_UI_SETTINGS.panelMaxWidthPx),
      0,
      1600
    ),
    sectionHeadersVisible:
      typeof candidate.sectionHeadersVisible === 'boolean'
        ? candidate.sectionHeadersVisible
        : DEFAULT_UI_SETTINGS.sectionHeadersVisible,
    sectionHeaderPlacement:
      candidate.sectionHeaderPlacement === 'pinned' ||
      candidate.sectionHeaderPlacement === 'flow' ||
      candidate.sectionHeaderPlacement === 'sticky'
        ? candidate.sectionHeaderPlacement
        : DEFAULT_UI_SETTINGS.sectionHeaderPlacement,
    sectionHeaderDensity:
      candidate.sectionHeaderDensity === 'compact' ||
      candidate.sectionHeaderDensity === 'normal' ||
      candidate.sectionHeaderDensity === 'comfortable'
        ? candidate.sectionHeaderDensity
        : DEFAULT_UI_SETTINGS.sectionHeaderDensity,
    sectionHeaderVariant:
      candidate.sectionHeaderVariant === 'full' || candidate.sectionHeaderVariant === 'mini'
        ? candidate.sectionHeaderVariant
        : DEFAULT_UI_SETTINGS.sectionHeaderVariant,

    // Glass settings
    glassPanelA1: clamp(Number(candidate.glassPanelA1 ?? DEFAULT_UI_SETTINGS.glassPanelA1), 0.05, 0.9),
    glassPanelA2: clamp(Number(candidate.glassPanelA2 ?? DEFAULT_UI_SETTINGS.glassPanelA2), 0.05, 0.9),
    glassPanelBlurPx: clamp(Number(candidate.glassPanelBlurPx ?? DEFAULT_UI_SETTINGS.glassPanelBlurPx), 0, 30),
    glassPanelBorderAlpha: clamp(
      Number(candidate.glassPanelBorderAlpha ?? DEFAULT_UI_SETTINGS.glassPanelBorderAlpha),
      0,
      0.9
    ),
    glassPanelRadiusRem: clamp(
      Number(candidate.glassPanelRadiusRem ?? DEFAULT_UI_SETTINGS.glassPanelRadiusRem),
      0.25,
      2.5
    ),
    glassSubtleA: clamp(Number(candidate.glassSubtleA ?? DEFAULT_UI_SETTINGS.glassSubtleA), 0.05, 0.8),
    glassSubtleBlurPx: clamp(Number(candidate.glassSubtleBlurPx ?? DEFAULT_UI_SETTINGS.glassSubtleBlurPx), 0, 24),
    glassSubtleBorderAlpha: clamp(
      Number(candidate.glassSubtleBorderAlpha ?? DEFAULT_UI_SETTINGS.glassSubtleBorderAlpha),
      0,
      0.9
    ),
    glassSubtleRadiusRem: clamp(
      Number(candidate.glassSubtleRadiusRem ?? DEFAULT_UI_SETTINGS.glassSubtleRadiusRem),
      0.25,
      2.5
    ),

    // Verse styles
    verseIdleBg:
      typeof candidate.verseIdleBg === 'string' && hexToRgb(candidate.verseIdleBg)
        ? candidate.verseIdleBg
        : DEFAULT_UI_SETTINGS.verseIdleBg,
    verseIdleBgAlpha: clamp(Number(candidate.verseIdleBgAlpha ?? DEFAULT_UI_SETTINGS.verseIdleBgAlpha), 0, 1),
    verseIdleBorder:
      typeof candidate.verseIdleBorder === 'string' && hexToRgb(candidate.verseIdleBorder)
        ? candidate.verseIdleBorder
        : DEFAULT_UI_SETTINGS.verseIdleBorder,
    verseIdleBorderAlpha: clamp(
      Number(candidate.verseIdleBorderAlpha ?? DEFAULT_UI_SETTINGS.verseIdleBorderAlpha),
      0,
      1
    ),
    verseFocusedBg:
      typeof candidate.verseFocusedBg === 'string' && hexToRgb(candidate.verseFocusedBg)
        ? candidate.verseFocusedBg
        : DEFAULT_UI_SETTINGS.verseFocusedBg,
    verseFocusedBgAlpha: clamp(
      Number(candidate.verseFocusedBgAlpha ?? DEFAULT_UI_SETTINGS.verseFocusedBgAlpha),
      0,
      1
    ),
    verseFocusedBorder:
      typeof candidate.verseFocusedBorder === 'string' && hexToRgb(candidate.verseFocusedBorder)
        ? candidate.verseFocusedBorder
        : DEFAULT_UI_SETTINGS.verseFocusedBorder,
    verseFocusedBorderAlpha: clamp(
      Number(candidate.verseFocusedBorderAlpha ?? DEFAULT_UI_SETTINGS.verseFocusedBorderAlpha),
      0,
      1
    ),
    verseActiveBg:
      typeof candidate.verseActiveBg === 'string' && hexToRgb(candidate.verseActiveBg)
        ? candidate.verseActiveBg
        : DEFAULT_UI_SETTINGS.verseActiveBg,
    verseActiveBgAlpha: clamp(
      Number(candidate.verseActiveBgAlpha ?? DEFAULT_UI_SETTINGS.verseActiveBgAlpha),
      0,
      1
    ),
    verseActiveBorder:
      typeof candidate.verseActiveBorder === 'string' && hexToRgb(candidate.verseActiveBorder)
        ? candidate.verseActiveBorder
        : DEFAULT_UI_SETTINGS.verseActiveBorder,
    verseActiveBorderAlpha: clamp(
      Number(candidate.verseActiveBorderAlpha ?? DEFAULT_UI_SETTINGS.verseActiveBorderAlpha),
      0,
      1
    ),
  };
}

/**
 * Hook for managing UI settings.
 */
export function useUISettings() {
  const [settings, setSettings] = useState<UISettings>(() => {
    const stored = safeGetItem(STORAGE_KEYS.UI_SETTINGS);
    return parseUISettings(safeJsonParse(stored, null));
  });

  // Persist settings to localStorage
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.UI_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Apply CSS variables when settings change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const rgb = hexToRgb(settings.accentColor);

    root.style.setProperty('--accent', settings.accentColor);
    if (rgb) root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--font-size', `${Math.round(16 * settings.fontScale)}px`);

    // Glass vars
    root.style.setProperty('--glass-panel-a1', String(settings.glassPanelA1));
    root.style.setProperty('--glass-panel-a2', String(settings.glassPanelA2));
    root.style.setProperty('--glass-panel-blur', `${Math.round(settings.glassPanelBlurPx)}px`);
    root.style.setProperty('--glass-panel-border-a', String(settings.glassPanelBorderAlpha));
    root.style.setProperty('--glass-panel-radius', `${settings.glassPanelRadiusRem}rem`);
    root.style.setProperty('--glass-subtle-a', String(settings.glassSubtleA));
    root.style.setProperty('--glass-subtle-blur', `${Math.round(settings.glassSubtleBlurPx)}px`);
    root.style.setProperty('--glass-subtle-border-a', String(settings.glassSubtleBorderAlpha));
    root.style.setProperty('--glass-subtle-radius', `${settings.glassSubtleRadiusRem}rem`);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<UISettings>) => {
    setSettings((prev) => parseUISettings({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_UI_SETTINGS);
  }, []);

  const iconPx = useMemo(() => Math.round(16 * settings.iconScale), [settings.iconScale]);
  const iconPxSm = useMemo(() => Math.round(14 * settings.iconScale), [settings.iconScale]);

  return {
    settings,
    updateSettings,
    resetSettings,
    iconPx,
    iconPxSm,
  };
}
