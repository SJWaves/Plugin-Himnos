import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Eye, EyeOff, Music, Search, Sliders, Bookmark, Trash2, ListMusic, Palette, Monitor } from 'lucide-react';
import { hymnbooks, searchHymns, Hymn } from '../data/hymns';
import {
  HymnBroadcaster,
  DisplayConfig,
  getStoredConfig,
  HymnDisplay,
  DEFAULT_CONFIG,
  ProjectionConfig,
  DEFAULT_PROJECTION_CONFIG,
  getStoredProjectionConfig,
} from '../utils/broadcast';
import {
  BACKGROUND_CATEGORIES,
  PROJECTION_BACKGROUNDS,
  type BackgroundCategory,
} from '../../shared/constants/projection-backgrounds';
import {
  DISPLAY_TEMPLATES,
  TEMPLATE_CATEGORIES,
  applyTemplate,
  type DisplayTemplate,
  PROJECTION_TEMPLATES,
  PROJECTION_TEMPLATE_CATEGORIES,
  applyProjectionTemplate,
  type ProjectionTemplate,
} from '../../shared/constants/templates';

type WindowTab = 'search' | 'hymn' | 'saved' | 'settings' | 'templates';

interface SavedHymn {
  hymnbookId: string;
  hymnbookName: string;
  hymn: Hymn;
}

type UISettings = {
  fontScale: number; // escala global (usa --font-size)
  iconScale: number; // escala de iconos del panel
  headerHeight: number; // alto del header principal
  accentColor: string; // hex (#RRGGBB)
  showHeader: boolean;
  showBottomNav: boolean;
  panelMaxWidthPx: number; // 0 = ancho completo
  sectionHeadersVisible: boolean; // paneles internos ("Himno #X", "Guardados", etc.)
  sectionHeaderPlacement: 'pinned' | 'flow' | 'sticky'; // "pinned" = fijo sin sobreponerse; "sticky" = se sobrepone
  sectionHeaderDensity: 'compact' | 'normal' | 'comfortable';
  sectionHeaderVariant: 'full' | 'mini';

  // Glass tuning (afecta panels/sticky)
  glassPanelA1: number;
  glassPanelA2: number;
  glassPanelBlurPx: number;
  glassPanelBorderAlpha: number;
  glassPanelRadiusRem: number;
  glassSubtleA: number;
  glassSubtleBlurPx: number;
  glassSubtleBorderAlpha: number;
  glassSubtleRadiusRem: number;

  // Versículos (colores separados: idle/focused/active)
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
};

const UI_SETTINGS_STORAGE_KEY = 'obs-ui-settings';

const DEFAULT_UI_SETTINGS: UISettings = {
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

const VERSE_STYLE_ROWS = [
  {
    key: 'idle',
    label: 'Idle',
    bg: 'verseIdleBg',
    bga: 'verseIdleBgAlpha',
    br: 'verseIdleBorder',
    bra: 'verseIdleBorderAlpha',
  },
  {
    key: 'focused',
    label: 'Enfocado',
    bg: 'verseFocusedBg',
    bga: 'verseFocusedBgAlpha',
    br: 'verseFocusedBorder',
    bra: 'verseFocusedBorderAlpha',
  },
  {
    key: 'active',
    label: 'Activo (al aire)',
    bg: 'verseActiveBg',
    bga: 'verseActiveBgAlpha',
    br: 'verseActiveBorder',
    bra: 'verseActiveBorderAlpha',
  },
] as const;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${clamp(alpha, 0, 1)})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
};

const parseUISettings = (raw: unknown): UISettings => {
  if (!raw || typeof raw !== 'object') return DEFAULT_UI_SETTINGS;
  const candidate = raw as Partial<UISettings>;

  const fontScale = clamp(Number(candidate.fontScale ?? DEFAULT_UI_SETTINGS.fontScale), 0.8, 1.6);
  const iconScale = clamp(Number(candidate.iconScale ?? DEFAULT_UI_SETTINGS.iconScale), 0.75, 1.8);
  const headerHeight = clamp(Number(candidate.headerHeight ?? DEFAULT_UI_SETTINGS.headerHeight), 44, 140);
  const accentColor =
    typeof candidate.accentColor === 'string' && hexToRgb(candidate.accentColor)
      ? candidate.accentColor
      : DEFAULT_UI_SETTINGS.accentColor;

  const showHeader = typeof candidate.showHeader === 'boolean' ? candidate.showHeader : DEFAULT_UI_SETTINGS.showHeader;
  const showBottomNav =
    typeof candidate.showBottomNav === 'boolean' ? candidate.showBottomNav : DEFAULT_UI_SETTINGS.showBottomNav;

  const panelMaxWidthPx = clamp(Number(candidate.panelMaxWidthPx ?? DEFAULT_UI_SETTINGS.panelMaxWidthPx), 0, 1600);

  const sectionHeadersVisible =
    typeof candidate.sectionHeadersVisible === 'boolean'
      ? candidate.sectionHeadersVisible
      : DEFAULT_UI_SETTINGS.sectionHeadersVisible;
  const sectionHeaderPlacement =
    candidate.sectionHeaderPlacement === 'pinned' ||
    candidate.sectionHeaderPlacement === 'flow' ||
    candidate.sectionHeaderPlacement === 'sticky'
      ? candidate.sectionHeaderPlacement
      : typeof (candidate as any).sectionHeadersSticky === 'boolean'
        ? ((candidate as any).sectionHeadersSticky ? 'sticky' : 'flow')
        : DEFAULT_UI_SETTINGS.sectionHeaderPlacement;
  const sectionHeaderDensity =
    candidate.sectionHeaderDensity === 'compact' ||
    candidate.sectionHeaderDensity === 'normal' ||
    candidate.sectionHeaderDensity === 'comfortable'
      ? candidate.sectionHeaderDensity
      : DEFAULT_UI_SETTINGS.sectionHeaderDensity;
  const sectionHeaderVariant =
    candidate.sectionHeaderVariant === 'full' || candidate.sectionHeaderVariant === 'mini'
      ? candidate.sectionHeaderVariant
      : DEFAULT_UI_SETTINGS.sectionHeaderVariant;

  const glassPanelA1 = clamp(Number(candidate.glassPanelA1 ?? DEFAULT_UI_SETTINGS.glassPanelA1), 0.05, 0.9);
  const glassPanelA2 = clamp(Number(candidate.glassPanelA2 ?? DEFAULT_UI_SETTINGS.glassPanelA2), 0.05, 0.9);
  const glassPanelBlurPx = clamp(Number(candidate.glassPanelBlurPx ?? DEFAULT_UI_SETTINGS.glassPanelBlurPx), 0, 30);
  const glassPanelBorderAlpha = clamp(
    Number(candidate.glassPanelBorderAlpha ?? DEFAULT_UI_SETTINGS.glassPanelBorderAlpha),
    0,
    0.9,
  );
  const glassPanelRadiusRem = clamp(
    Number(candidate.glassPanelRadiusRem ?? DEFAULT_UI_SETTINGS.glassPanelRadiusRem),
    0.25,
    2.5,
  );

  const glassSubtleA = clamp(Number(candidate.glassSubtleA ?? DEFAULT_UI_SETTINGS.glassSubtleA), 0.05, 0.8);
  const glassSubtleBlurPx = clamp(Number(candidate.glassSubtleBlurPx ?? DEFAULT_UI_SETTINGS.glassSubtleBlurPx), 0, 24);
  const glassSubtleBorderAlpha = clamp(
    Number(candidate.glassSubtleBorderAlpha ?? DEFAULT_UI_SETTINGS.glassSubtleBorderAlpha),
    0,
    0.9,
  );
  const glassSubtleRadiusRem = clamp(
    Number(candidate.glassSubtleRadiusRem ?? DEFAULT_UI_SETTINGS.glassSubtleRadiusRem),
    0.25,
    2.5,
  );

  const verseIdleBg =
    typeof candidate.verseIdleBg === 'string' && hexToRgb(candidate.verseIdleBg)
      ? candidate.verseIdleBg
      : DEFAULT_UI_SETTINGS.verseIdleBg;
  const verseIdleBgAlpha = clamp(Number(candidate.verseIdleBgAlpha ?? DEFAULT_UI_SETTINGS.verseIdleBgAlpha), 0, 1);
  const verseIdleBorder =
    typeof candidate.verseIdleBorder === 'string' && hexToRgb(candidate.verseIdleBorder)
      ? candidate.verseIdleBorder
      : DEFAULT_UI_SETTINGS.verseIdleBorder;
  const verseIdleBorderAlpha = clamp(
    Number(candidate.verseIdleBorderAlpha ?? DEFAULT_UI_SETTINGS.verseIdleBorderAlpha),
    0,
    1,
  );

  const verseFocusedBg =
    typeof candidate.verseFocusedBg === 'string' && hexToRgb(candidate.verseFocusedBg)
      ? candidate.verseFocusedBg
      : DEFAULT_UI_SETTINGS.verseFocusedBg;
  const verseFocusedBgAlpha = clamp(
    Number(candidate.verseFocusedBgAlpha ?? DEFAULT_UI_SETTINGS.verseFocusedBgAlpha),
    0,
    1,
  );
  const verseFocusedBorder =
    typeof candidate.verseFocusedBorder === 'string' && hexToRgb(candidate.verseFocusedBorder)
      ? candidate.verseFocusedBorder
      : DEFAULT_UI_SETTINGS.verseFocusedBorder;
  const verseFocusedBorderAlpha = clamp(
    Number(candidate.verseFocusedBorderAlpha ?? DEFAULT_UI_SETTINGS.verseFocusedBorderAlpha),
    0,
    1,
  );

  const verseActiveBg =
    typeof candidate.verseActiveBg === 'string' && hexToRgb(candidate.verseActiveBg)
      ? candidate.verseActiveBg
      : DEFAULT_UI_SETTINGS.verseActiveBg;
  const verseActiveBgAlpha = clamp(
    Number(candidate.verseActiveBgAlpha ?? DEFAULT_UI_SETTINGS.verseActiveBgAlpha),
    0,
    1,
  );
  const verseActiveBorder =
    typeof candidate.verseActiveBorder === 'string' && hexToRgb(candidate.verseActiveBorder)
      ? candidate.verseActiveBorder
      : DEFAULT_UI_SETTINGS.verseActiveBorder;
  const verseActiveBorderAlpha = clamp(
    Number(candidate.verseActiveBorderAlpha ?? DEFAULT_UI_SETTINGS.verseActiveBorderAlpha),
    0,
    1,
  );

  return {
    fontScale,
    iconScale,
    headerHeight,
    accentColor,
    showHeader,
    showBottomNav,
    panelMaxWidthPx,
    sectionHeadersVisible,
    sectionHeaderPlacement,
    sectionHeaderDensity,
    sectionHeaderVariant,
    glassPanelA1,
    glassPanelA2,
    glassPanelBlurPx,
    glassPanelBorderAlpha,
    glassPanelRadiusRem,
    glassSubtleA,
    glassSubtleBlurPx,
    glassSubtleBorderAlpha,
    glassSubtleRadiusRem,
    verseIdleBg,
    verseIdleBgAlpha,
    verseIdleBorder,
    verseIdleBorderAlpha,
    verseFocusedBg,
    verseFocusedBgAlpha,
    verseFocusedBorder,
    verseFocusedBorderAlpha,
    verseActiveBg,
    verseActiveBgAlpha,
    verseActiveBorder,
    verseActiveBorderAlpha,
  };
};

const loadUISettings = (): UISettings => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return DEFAULT_UI_SETTINGS;
  const stored = window.localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
  if (!stored) return DEFAULT_UI_SETTINGS;
  try {
    return parseUISettings(JSON.parse(stored));
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
};

const CUSTOM_TEMPLATES_STORAGE_KEY = 'obs-custom-templates';

const loadCustomTemplates = (): DisplayTemplate[] => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is DisplayTemplate =>
        t != null && typeof t === 'object' && typeof t.id === 'string' && typeof t.name === 'string',
    );
  } catch {
    return [];
  }
};

const isSavedHymnEntry = (entry: unknown): entry is SavedHymn => {
  if (!entry || typeof entry !== 'object') return false;
  const candidate = entry as SavedHymn;
  return (
    typeof candidate.hymnbookId === 'string' &&
    typeof candidate.hymnbookName === 'string' &&
    candidate.hymn &&
    typeof candidate.hymn.number === 'number' &&
    typeof candidate.hymn.title === 'string' &&
    Array.isArray(candidate.hymn.verses) &&
    candidate.hymn.verses.every((verse) => typeof verse === 'string')
  );
};

const loadSavedHymns = (): SavedHymn[] => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return [];
  const stored = window.localStorage.getItem('obs-saved-hymns');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedHymnEntry);
  } catch (error) {
    console.warn('[ControlPage] limpieza de himnos guardados fallida:', error);
    return [];
  }
};

export default function ControlPage() {
  const [activeTab, setActiveTab] = useState<WindowTab>('search');
  const [hymnbookId, setHymnbookId] = useState('celebremos_su_gloria');
  
  const [hymnSearchQuery, setHymnSearchQuery] = useState('');
  
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [searchResults, setSearchResults] = useState<Hymn[]>([]);
  
  // activeVerseIndex = Lo que está en vivo en OBS
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  // focusedVerseIndex = Lo que está resaltado localmente para navegar
  const [focusedVerseIndex, setFocusedVerseIndex] = useState<number | null>(null);
  
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig());
  const [broadcaster] = useState(() => new HymnBroadcaster());

  // Estado para los himnos guardados (persiste en localStorage)
  const [savedHymns, setSavedHymns] = useState<SavedHymn[]>(() => loadSavedHymns());

  // Configuración visual del panel (persistente)
  const [uiSettings, setUISettings] = useState<UISettings>(() => loadUISettings());

  const [customTemplates, setCustomTemplates] = useState<DisplayTemplate[]>(() => loadCustomTemplates());
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const [projectionConfig, setProjectionConfig] = useState<ProjectionConfig>(() => getStoredProjectionConfig());

  const verseRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const searchListRef = useRef<HTMLDivElement | null>(null);
  const searchItemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [searchActiveNumber, setSearchActiveNumber] = useState<number | null>(null);

  // Guardar en localStorage cuando cambie la lista de guardados
  useEffect(() => {
    localStorage.setItem('obs-saved-hymns', JSON.stringify(savedHymns));
  }, [savedHymns]);

  // Persistencia de plantillas personalizadas
  useEffect(() => {
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Persistencia y broadcast de configuración de proyección
  useEffect(() => {
    localStorage.setItem('obs-projection-config', JSON.stringify(projectionConfig));
    broadcaster.sendProjectionConfig(projectionConfig);
  }, [projectionConfig]);

  // Persistencia de UI Settings
  useEffect(() => {
    try {
      localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(uiSettings));
    } catch (error) {
      console.warn('[ControlPage] no se pudo guardar UISettings:', error);
    }
  }, [uiSettings]);

  // Aplicar variables CSS globales (accent + font-size) para que afecte a TODO el panel
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const rgb = hexToRgb(uiSettings.accentColor);

    root.style.setProperty('--accent', uiSettings.accentColor);
    if (rgb) root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--font-size', `${Math.round(16 * uiSettings.fontScale)}px`);

    // Glass vars
    root.style.setProperty('--glass-panel-a1', String(uiSettings.glassPanelA1));
    root.style.setProperty('--glass-panel-a2', String(uiSettings.glassPanelA2));
    root.style.setProperty('--glass-panel-blur', `${Math.round(uiSettings.glassPanelBlurPx)}px`);
    root.style.setProperty('--glass-panel-border-a', String(uiSettings.glassPanelBorderAlpha));
    root.style.setProperty('--glass-panel-radius', `${uiSettings.glassPanelRadiusRem}rem`);
    root.style.setProperty('--glass-subtle-a', String(uiSettings.glassSubtleA));
    root.style.setProperty('--glass-subtle-blur', `${Math.round(uiSettings.glassSubtleBlurPx)}px`);
    root.style.setProperty('--glass-subtle-border-a', String(uiSettings.glassSubtleBorderAlpha));
    root.style.setProperty('--glass-subtle-radius', `${uiSettings.glassSubtleRadiusRem}rem`);
  }, [
    uiSettings.accentColor,
    uiSettings.fontScale,
    uiSettings.glassPanelA1,
    uiSettings.glassPanelA2,
    uiSettings.glassPanelBlurPx,
    uiSettings.glassPanelBorderAlpha,
    uiSettings.glassPanelRadiusRem,
    uiSettings.glassSubtleA,
    uiSettings.glassSubtleBlurPx,
    uiSettings.glassSubtleBorderAlpha,
    uiSettings.glassSubtleRadiusRem,
  ]);

  const iconPx = useMemo(() => Math.round(16 * uiSettings.iconScale), [uiSettings.iconScale]);
  const iconPxSm = useMemo(() => Math.round(14 * uiSettings.iconScale), [uiSettings.iconScale]);

  const updateUISettings = (patch: Partial<UISettings>) => {
    setUISettings((prev) => parseUISettings({ ...prev, ...patch }));
  };

  const sectionHeader = useMemo(() => {
    const isCompact = uiSettings.sectionHeaderDensity === 'compact';
    const isComfortable = uiSettings.sectionHeaderDensity === 'comfortable';
    const isMini = uiSettings.sectionHeaderVariant === 'mini';
    return {
      pad: isMini ? (isCompact ? 'p-2' : 'p-2.5') : isCompact ? 'p-2' : isComfortable ? 'p-4' : 'p-3',
      label: isMini ? 'text-[9px]' : isCompact ? 'text-[9px]' : 'text-[10px]',
      title: isMini ? 'text-xs' : isCompact ? 'text-xs' : 'text-sm',
      subtitle: isMini ? 'text-[9px]' : isCompact ? 'text-[9px]' : 'text-[10px]',
      iconWrap: isMini ? 'p-1' : isCompact ? 'p-1' : 'p-1.5',
      btnIcon: isCompact ? iconPxSm : iconPxSm,
      btnPad: isCompact ? 'p-1' : 'p-1.5',
      btnText: isCompact ? 'text-[10px]' : 'text-[11px]',
      actionPad: isCompact ? 'px-2 py-1' : 'px-2.5 py-1.5',
      isMini,
    };
  }, [uiSettings.sectionHeaderDensity, iconPxSm]);

  // Cargar todos los himnos del himnario seleccionado para la búsqueda
  useEffect(() => {
    const results = searchHymns(hymnbookId, '');
    const sortedResults = results.sort((a, b) => a.number - b.number);
    setSearchResults(sortedResults);
  }, [hymnbookId]);

  // Atajos de teclado globales (Ctrl + 1, 2, 3, 4, 5)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('search'); }
        if (e.key === '2') { e.preventDefault(); if (selectedHymn) setActiveTab('hymn'); }
        if (e.key === '3') { e.preventDefault(); setActiveTab('saved'); }
        if (e.key === '4') { e.preventDefault(); setActiveTab('templates'); }
        if (e.key === '5') { e.preventDefault(); setActiveTab('settings'); }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedHymn]);

  // Navegación con teclado (solo en ventana de himno)
  useEffect(() => {
    if (activeTab !== 'hymn' || !selectedHymn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) return; // Evitar conflictos con los atajos globales

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedVerseIndex((prev) => {
          const next = Math.min((prev ?? -1) + 1, selectedHymn.verses.length - 1);
          // Si ya está al aire, cambiar y transmitir automáticamente
          if (activeVerseIndex !== null) handleShowVerse(next, false);
          return next;
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedVerseIndex((prev) => {
          const next = Math.max((prev ?? 0) - 1, 0);
          // Si ya está al aire, cambiar y transmitir automáticamente
          if (activeVerseIndex !== null) handleShowVerse(next, false);
          return next;
        });
        return;
      }
      
      // Solo el Punto (.) actúa como toggle al aire — Enter queda libre para búsqueda
      if (e.key === '.') {
        e.preventDefault();
        if (activeVerseIndex !== null) {
          handleHideAll(); // Si hay algo, lo quita
        } else {
          // Si no hay nada, pone al aire el que esté enfocado
          handleShowVerse(focusedVerseIndex ?? 0, true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedHymn, activeVerseIndex, focusedVerseIndex]);

  // Centrar el scroll en la estrofa enfocada (focused)
  useEffect(() => {
    if (focusedVerseIndex !== null && verseRefs.current[focusedVerseIndex]) {
      verseRefs.current[focusedVerseIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusedVerseIndex]);

  const handleSelectHymn = (hymn: Hymn, bookId: string = hymnbookId) => {
    setHymnbookId(bookId);
    setSelectedHymn(hymn);
    setActiveTab('hymn');
    setHymnSearchQuery('');
    setActiveVerseIndex(null);
    setFocusedVerseIndex(0); // Enfocar la primera estrofa por defecto, pero no transmitirla
    broadcaster.clearDisplay();
  };

  const handleShowVerse = (verseIndex: number, updateFocus: boolean = true) => {
    if (!selectedHymn) return;
    const clampedIndex = Math.max(0, Math.min(verseIndex, selectedHymn.verses.length - 1));
    const display: HymnDisplay = {
      hymnbookId,
      hymnNumber: selectedHymn.number,
      hymnTitle: selectedHymn.title,
      verseIndex: clampedIndex,
      verseText: selectedHymn.verses[clampedIndex],
      config,
    };
    broadcaster.sendDisplay(display);
    setActiveVerseIndex(clampedIndex);
    if (updateFocus) setFocusedVerseIndex(clampedIndex);
  };

  const handleHideAll = () => {
    broadcaster.clearDisplay();
    setActiveVerseIndex(null);
  };

  const handleConfigChange = (newConfig: Partial<DisplayConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    broadcaster.sendConfig(updatedConfig);

    // Si hay un verso al aire, re-enviar el display con la config embebida
    // para que el Display se actualice incluso si no recibe el mensaje "config".
    if (selectedHymn && activeVerseIndex !== null) {
      const clampedIndex = Math.max(0, Math.min(activeVerseIndex, selectedHymn.verses.length - 1));
      const display: HymnDisplay = {
        hymnbookId,
        hymnNumber: selectedHymn.number,
        hymnTitle: selectedHymn.title,
        verseIndex: clampedIndex,
        verseText: selectedHymn.verses[clampedIndex],
        config: updatedConfig,
      };
      broadcaster.sendDisplay(display);
    }
  };

  const saveCustomTemplate = (name: string) => {
    const trimmed = name.trim();
    const newTemplate: DisplayTemplate = {
      id: `custom-${Date.now()}`,
      name: trimmed || `Mi plantilla ${customTemplates.length + 1}`,
      description: 'Plantilla personalizada guardada',
      category: 'custom',
      preview: {
        backgroundColor: config.showPanel ? config.panelBackground : 'transparent',
        textColor: config.textColor,
        accentColor: config.titleColor,
      },
      config: { ...config },
    };
    setCustomTemplates((prev) => [newTemplate, ...prev]);
    setShowSaveTemplateForm(false);
    setNewTemplateName('');
  };

  const deleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const updateProjectionConfig = (patch: Partial<ProjectionConfig>) => {
    setProjectionConfig((prev) => ({ ...prev, ...patch }));
  };

  const toggleSaveHymn = () => {
    if (!selectedHymn) return;
    const isSaved = savedHymns.some(sh => sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number);
    if (isSaved) {
      setSavedHymns(savedHymns.filter(sh => !(sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number)));
    } else {
      setSavedHymns([...savedHymns, { hymnbookId, hymnbookName: hymnbooks[hymnbookId].name, hymn: selectedHymn }]);
    }
  };

  const removeSavedHymn = (bookId: string, hymnNum: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evitar que se seleccione el himno al hacer clic en borrar
    setSavedHymns(savedHymns.filter(sh => !(sh.hymnbookId === bookId && sh.hymn.number === hymnNum)));
  };

  const filteredHymns = searchResults.filter(
    (hymn) =>
      hymn.title.toLowerCase().includes(hymnSearchQuery.toLowerCase()) ||
      hymn.number.toString().includes(hymnSearchQuery)
  );

  const getBestSearchMatch = () => {
    const query = hymnSearchQuery.trim();
    if (!query) return null;

    const isNumericQuery = /^\d+$/.test(query);
    const asNumber = isNumericQuery ? Number(query) : null;
    const normalized = query.toLowerCase();

    return (
      (isNumericQuery ? filteredHymns.find((h) => h.number === asNumber) : undefined) ??
      filteredHymns.find((h) => h.title.toLowerCase().startsWith(normalized)) ??
      filteredHymns[0] ??
      null
    );
  };

  // Al escribir en búsqueda: centrar automáticamente el resultado más coincidente en pantalla.
  useEffect(() => {
    if (activeTab !== 'search') return;
    const query = hymnSearchQuery.trim();
    if (!query) {
      setSearchActiveNumber(null);
      return;
    }

    const best = getBestSearchMatch();

    if (!best) {
      setSearchActiveNumber(null);
      return;
    }

    setSearchActiveNumber(best.number);
    const el = searchItemRefs.current.get(best.number);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeTab, filteredHymns, hymnSearchQuery]);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col relative">
      {/* Fondo con gradiente decorativo estilo HomePage */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at center, rgba(197, 160, 33, 0.2) 0%, transparent 80%)`,
        }}
      />

      <div
        className="relative z-10 w-full h-full flex flex-col mx-auto"
        style={uiSettings.panelMaxWidthPx > 0 ? { maxWidth: `${uiSettings.panelMaxWidthPx}px` } : undefined}
      >
        {/* Header (fixed) */}
        {uiSettings.showHeader && (
          <div
            className="flex-none z-20 glass-panel border-b border-accent/20 p-3 relative"
            style={{ height: uiSettings.headerHeight }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-base font-bold text-accent-glow truncate leading-tight">
                  Control de Himnos
                </h1>
                <p className="text-[10px] text-white/50 truncate flex gap-2 mt-0.5">
                  <span>Ctrl+1 Búsqueda</span>
                  <span>Ctrl+2 Himno</span>
                  <span>Ctrl+3 Guardados</span>
                  <span>Ctrl+4 Plantillas</span>
                </p>
              </div>
              <div className="hidden sm:block text-[10px] text-white/50 text-right leading-tight">
                <div>↑ ↓ navega</div>
                <div>
                  <span className="inline-flex items-center justify-center px-1.5 rounded glass-subtle border border-accent/20 text-white/70">
                    .
                  </span>{' '}
                  transmite
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content (Responsive, scroll interno manejado por pestañas) */}
        <div className="flex-1 overflow-hidden relative z-10">
          <div className="w-full h-full">
          
          {/* Tab: Search */}
          {activeTab === 'search' && (
            <div className="flex flex-col h-full p-3 space-y-3">
              <div className="space-y-1.5 flex-none">
                <label className="block text-[11px] font-medium text-white/70">
                  Himnario
                </label>
                <select
                  value={hymnbookId}
                  onChange={(e) => {
                    setHymnbookId(e.target.value);
                    setHymnSearchQuery('');
                  }}
                  className="w-full rounded-md glass-subtle border border-accent/20 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 appearance-none [&>option]:bg-black"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%23C5A021%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.8rem' }}
                >
                  {Object.entries(hymnbooks).map(([id, book]) => (
                    <option key={id} value={id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-none">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-accent/70"
                  style={{ width: iconPxSm, height: iconPxSm }}
                />
                <input
                  type="text"
                  placeholder="Buscar número o título..."
                  value={hymnSearchQuery}
                  onChange={(e) => setHymnSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const best = getBestSearchMatch();
                      if (best) handleSelectHymn(best);
                    }
                  }}
                  className="w-full glass-subtle border border-accent/20 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-white/30"
                  autoFocus
                />
              </div>

              {/* Lista integrada con Scroll interno */}
              <div
                ref={searchListRef}
                className="flex-1 overflow-y-auto rounded-md border border-accent/20 glass-panel ctrl-scroll"
              >
                {filteredHymns.length > 0 ? (
                  filteredHymns.map((hymn) => (
                    <button
                      key={hymn.number}
                      ref={(el) => {
                        if (!el) {
                          searchItemRefs.current.delete(hymn.number);
                          return;
                        }
                        searchItemRefs.current.set(hymn.number, el);
                      }}
                      onClick={() => handleSelectHymn(hymn)}
                      className={`w-full text-left px-3 py-2 text-xs focus:outline-none transition-colors flex items-center gap-2 border-b border-accent/10 last:border-0 ${
                        searchActiveNumber === hymn.number ? 'bg-accent/10' : 'hover:bg-accent/10'
                      }`}
                    >
                      <span className="text-accent font-bold min-w-[2.2rem]">#{hymn.number}</span>
                      <span className="text-white/90 truncate flex-1">{hymn.title}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[11px] text-white/40">
                    No se encontraron himnos.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Saved (Guardados) */}
          {activeTab === 'saved' && (
            <div className="flex flex-col h-full p-3 space-y-3">
              {uiSettings.sectionHeadersVisible && (
                <div
                  className={`rounded-lg glass-panel border border-accent/20 flex items-center gap-2 flex-none ${sectionHeader.pad}`}
                >
                  <Bookmark className="text-accent" style={{ width: iconPx, height: iconPx }} />
                  <div>
                    <h2 className={`${sectionHeader.title} font-bold text-white`}>Himnos Guardados</h2>
                    <p className={`${sectionHeader.subtitle} text-white/50`}>Lista rápida para la reunión de hoy</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2 ctrl-scroll pb-2">
                {savedHymns.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-accent/30 rounded-lg glass-subtle">
                    <p className="text-xs text-white/40">No hay himnos guardados aún.</p>
                    <p className="text-[10px] text-white/30 mt-1">Busca un himno y usa el icono de guardar.</p>
                  </div>
                ) : (
                  savedHymns.map((saved, idx) => (
                    <div key={`${saved.hymnbookId}-${saved.hymn.number}-${idx}`} className="flex gap-2">
                      <button
                        onClick={() => handleSelectHymn(saved.hymn, saved.hymnbookId)}
                        className="flex-1 text-left rounded-md glass-subtle border border-accent/20 p-2 hover:border-accent/50 transition-all focus:outline-none"
                      >
                        <div className="text-[9px] text-accent/80 mb-0.5">{saved.hymnbookName}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-accent font-bold">#{saved.hymn.number}</span>
                          <span className="text-white/90 truncate">{saved.hymn.title}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => removeSavedHymn(saved.hymnbookId, saved.hymn.number, e)}
                        className="flex-none flex items-center justify-center px-3 rounded-md glass-subtle border border-accent/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all"
                        title="Eliminar de guardados"
                      >
                        <Trash2 style={{ width: iconPx, height: iconPx }} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Hymn */}
          {activeTab === 'hymn' && (
            selectedHymn ? (
            <div className={`h-full pb-2 ${uiSettings.sectionHeaderPlacement === 'pinned' ? 'overflow-hidden' : 'overflow-y-auto'} p-3 space-y-3 ctrl-scroll`}>
              {uiSettings.sectionHeadersVisible && (
                <div
                  className={`rounded-lg glass-panel border border-accent/20 shadow-md ${
                    uiSettings.sectionHeaderPlacement === 'sticky' ? 'sticky top-0 z-10' : ''
                  } ${sectionHeader.pad}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {sectionHeader.isMini ? (
                        <div className={`${sectionHeader.title} font-bold text-white truncate`}>
                          <span className="text-accent">Himno #{selectedHymn.number}</span>{' '}
                          <span className="text-white/80">—</span>{' '}
                          <span className="text-white">{selectedHymn.title}</span>
                        </div>
                      ) : (
                        <>
                          <div className={`${sectionHeader.label} font-semibold text-accent`}>
                            Himno #{selectedHymn.number}
                          </div>
                          <h2 className={`${sectionHeader.title} font-bold text-white mt-0.5 truncate`}>
                            {selectedHymn.title}
                          </h2>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-none">
                      <button
                        onClick={toggleSaveHymn}
                        className={`${sectionHeader.btnPad} rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50 ${
                          savedHymns.some(sh => sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number)
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/50 hover:text-white'
                        }`}
                        title="Guardar himno"
                      >
                        <Bookmark style={{ width: sectionHeader.btnIcon, height: sectionHeader.btnIcon }} />
                      </button>
                      <button
                        onClick={handleHideAll}
                        disabled={activeVerseIndex === null}
                        className={`flex items-center gap-1.5 ${sectionHeader.actionPad} rounded-md border transition-colors ${sectionHeader.btnText} whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-accent/50 ${
                          activeVerseIndex !== null
                            ? 'glass-subtle border-accent/40 text-white hover:border-accent'
                            : 'bg-black/50 border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                        title="Ocultar (Enter o .)"
                      >
                        <EyeOff style={{ width: sectionHeader.btnIcon, height: sectionHeader.btnIcon }} />
                        {!sectionHeader.isMini && 'Ocultar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={`${uiSettings.sectionHeaderPlacement === 'pinned' ? 'flex-1 overflow-y-auto' : ''} space-y-1.5`}>
                {selectedHymn.verses.map((verse, index) => {
                  const isActive = activeVerseIndex === index;
                  const isFocused = focusedVerseIndex === index;

                  return (
                    <button
                      key={index}
                      ref={(el) => {
                        verseRefs.current[index] = el;
                      }}
                      onClick={() => {
                        if (isActive) {
                          handleHideAll();
                        } else {
                          handleShowVerse(index, true);
                        }
                      }}
                      className="w-full text-left rounded-lg border p-2.5 transition-all duration-300 focus:outline-none backdrop-blur-md"
                      style={{
                        background: isActive
                          ? hexToRgba(uiSettings.verseActiveBg, uiSettings.verseActiveBgAlpha)
                          : isFocused
                            ? hexToRgba(uiSettings.verseFocusedBg, uiSettings.verseFocusedBgAlpha)
                            : hexToRgba(uiSettings.verseIdleBg, uiSettings.verseIdleBgAlpha),
                        borderColor: isActive
                          ? hexToRgba(uiSettings.verseActiveBorder, uiSettings.verseActiveBorderAlpha)
                          : isFocused
                            ? hexToRgba(uiSettings.verseFocusedBorder, uiSettings.verseFocusedBorderAlpha)
                            : hexToRgba(uiSettings.verseIdleBorder, uiSettings.verseIdleBorderAlpha),
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="min-w-[1.75rem] h-6 rounded flex items-center justify-center font-bold text-[11px]"
                          style={{
                            background: isActive
                              ? 'rgba(255,255,255,0.15)'
                              : isFocused
                                ? 'rgba(255,255,255,0.15)'
                                : 'rgba(0,0,0,0.4)',
                            color: isActive || isFocused ? '#ffffff' : 'rgba(255,255,255,0.5)',
                            border: isActive ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <p
                            className="whitespace-pre-line leading-snug text-[11px] sm:text-xs"
                            style={{
                              color: isActive && isFocused ? '#ffffff' : 'rgba(255,255,255,0.8)',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {verse}
                          </p>
                        </div>

                        {isActive && (
                          <Eye className="text-white flex-shrink-0" style={{ width: iconPx, height: iconPx }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            ) : (
              <div className="h-full p-3">
                <div className="rounded-lg glass-subtle border border-accent/20 p-4 text-center">
                  <div className="text-sm font-bold text-white">No hay himno seleccionado</div>
                  <div className="text-[11px] text-white/50 mt-1">
                    Ve a <span className="text-accent">Buscar</span> (Ctrl+1) y selecciona un himno para ver los versículos.
                  </div>
                </div>
              </div>
            )
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto p-3 space-y-4 ctrl-scroll">
              {uiSettings.sectionHeadersVisible && (
                <div className={`rounded-lg glass-panel border border-accent/20 flex items-center gap-2.5 relative z-10 ${sectionHeader.pad}`}>
                  <div className={`${sectionHeader.iconWrap} bg-accent/20 rounded-md`}>
                    <Sliders className="text-accent" style={{ width: iconPx, height: iconPx }} />
                  </div>
                  <div>
                    <h2 className={`${sectionHeader.title} font-bold text-white`}>Configuración</h2>
                    <p className={`${sectionHeader.subtitle} text-white/50`}>Panel de control y transmisión</p>
                  </div>
                </div>
              )}

              {/* Configuración avanzada del panel (Control) */}
              <div className="rounded-lg glass-panel border border-accent/20 p-3 space-y-4 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div>
	                    <h3 className="text-sm font-bold text-white">Ajustes del Panel</h3>
	                    <p className="text-[10px] text-white/50">Afecta a TODO el panel (control)</p>
	                  </div>
	                  <button
	                    onClick={() => setUISettings(DEFAULT_UI_SETTINGS)}
	                    className="rounded-md glass-subtle border border-accent/20 px-2.5 py-1.5 text-[11px] text-white/80 hover:border-accent/50 transition-colors"
	                    title="Restaurar por defecto"
	                  >
	                    Restaurar
	                  </button>
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-4">
	                  <div className="space-y-2">
	                    <label className="block text-[11px] font-medium text-white/90">Color de acento</label>
	                    <div className="flex items-center gap-2">
	                      <input
	                        type="color"
	                        value={uiSettings.accentColor}
	                        onChange={(e) => updateUISettings({ accentColor: e.target.value })}
	                        className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
	                        aria-label="Color de acento"
	                      />
	                      <input
	                        type="text"
	                        value={uiSettings.accentColor}
	                        onChange={(e) => updateUISettings({ accentColor: e.target.value })}
	                        className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
	                        spellCheck={false}
	                      />
	                    </div>
	                  </div>

	                  <div className="grid grid-cols-2 gap-2">
	                    <button
	                      onClick={() => updateUISettings({ showHeader: !uiSettings.showHeader })}
	                      className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
	                        uiSettings.showHeader
	                          ? 'bg-accent/15 border-accent/40 text-white'
	                          : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
	                      }`}
	                    >
	                      {uiSettings.showHeader ? 'Header: visible' : 'Header: oculto'}
	                    </button>
	                    <button
	                      onClick={() => updateUISettings({ showBottomNav: !uiSettings.showBottomNav })}
	                      className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
	                        uiSettings.showBottomNav
	                          ? 'bg-accent/15 border-accent/40 text-white'
	                          : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
	                      }`}
	                    >
	                      {uiSettings.showBottomNav ? 'Tabs: visibles' : 'Tabs: ocultas'}
	                    </button>
	                  </div>
		                  <div className="glass-divider opacity-60" />
		                  <div className="grid grid-cols-2 gap-2">
		                    <button
		                      onClick={() => updateUISettings({ sectionHeadersVisible: !uiSettings.sectionHeadersVisible })}
		                      className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
		                        uiSettings.sectionHeadersVisible
		                          ? 'bg-accent/15 border-accent/40 text-white'
		                          : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
		                      }`}
		                      title="Paneles internos (Himno #X, Guardados, etc.)"
		                    >
		                      {uiSettings.sectionHeadersVisible ? 'Paneles internos: ON' : 'Paneles internos: OFF'}
		                    </button>
		                    <button
		                      onClick={() =>
		                        updateUISettings({
		                          sectionHeaderVariant: uiSettings.sectionHeaderVariant === 'full' ? 'mini' : 'full',
		                        })
		                      }
		                      className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
		                        uiSettings.sectionHeaderVariant === 'mini'
		                          ? 'bg-accent/15 border-accent/40 text-white'
		                          : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
		                      }`}
		                      title="Reduce el tamaño del panel guía"
		                    >
		                      {uiSettings.sectionHeaderVariant === 'mini' ? 'Guía: mini' : 'Guía: full'}
		                    </button>
		                  </div>
		                  <div className="grid grid-cols-3 gap-2">
		                    {(['pinned', 'flow', 'sticky'] as const).map((mode) => (
		                      <button
		                        key={mode}
		                        onClick={() => updateUISettings({ sectionHeaderPlacement: mode })}
		                        className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
		                          uiSettings.sectionHeaderPlacement === mode
		                            ? 'bg-accent/15 border-accent/40 text-white'
		                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
		                        }`}
		                        title={
		                          mode === 'pinned'
		                            ? 'Fijo (no se sobrepone). Recomendado para OBS.'
		                            : mode === 'flow'
		                              ? 'Se mueve con el scroll (no queda fijo).'
		                              : 'Se queda pegado arriba y puede sobreponerse.'
		                        }
		                      >
		                        {mode === 'pinned' ? 'Estático' : mode === 'flow' ? 'Normal' : 'Sticky'}
		                      </button>
		                    ))}
		                  </div>
		                  <div className="grid grid-cols-3 gap-2">
		                    {(['compact', 'normal', 'comfortable'] as const).map((d) => (
		                      <button
		                        key={d}
	                        onClick={() => updateUISettings({ sectionHeaderDensity: d })}
	                        className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
	                          uiSettings.sectionHeaderDensity === d
	                            ? 'bg-accent/15 border-accent/40 text-white'
	                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
	                        }`}
	                      >
	                        {d === 'compact' ? 'Compacto' : d === 'normal' ? 'Normal' : 'Amplio'}
	                      </button>
	                    ))}
	                  </div>
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="flex justify-between items-center">
	                    <label className="block text-[11px] font-medium text-white/90">Tipografía (global)</label>
	                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
	                      {uiSettings.fontScale.toFixed(2)}x
	                    </span>
	                  </div>
	                  <div className="grid grid-cols-3 gap-2">
	                    <button
	                      onClick={() => updateUISettings({ fontScale: 0.9 })}
	                      className="rounded-md border border-accent/20 px-2.5 py-2 text-[11px] text-white/80 hover:border-accent/50 transition-colors"
	                    >
	                      Pequeña
	                    </button>
	                    <button
	                      onClick={() => updateUISettings({ fontScale: 1 })}
	                      className="rounded-md border border-accent/20 px-2.5 py-2 text-[11px] text-white/80 hover:border-accent/50 transition-colors"
	                    >
	                      Mediana
	                    </button>
	                    <button
	                      onClick={() => updateUISettings({ fontScale: 1.1 })}
	                      className="rounded-md border border-accent/20 px-2.5 py-2 text-[11px] text-white/80 hover:border-accent/50 transition-colors"
	                    >
	                      Grande
	                    </button>
	                  </div>
	                  <input
	                    type="range"
	                    min="0.8"
	                    max="1.6"
	                    step="0.05"
	                    value={uiSettings.fontScale}
	                    onChange={(e) => updateUISettings({ fontScale: parseFloat(e.target.value) })}
	                    className="w-full cursor-pointer accent-accent"
	                  />
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="flex justify-between items-center">
	                    <label className="block text-[11px] font-medium text-white/90">Iconos (panel)</label>
	                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
	                      {uiSettings.iconScale.toFixed(2)}x
	                    </span>
	                  </div>
	                  <input
	                    type="range"
	                    min="0.75"
	                    max="1.8"
	                    step="0.05"
	                    value={uiSettings.iconScale}
	                    onChange={(e) => updateUISettings({ iconScale: parseFloat(e.target.value) })}
	                    className="w-full cursor-pointer accent-accent"
	                  />
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="flex justify-between items-center">
	                    <label className="block text-[11px] font-medium text-white/90">Header (altura)</label>
	                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
	                      {Math.round(uiSettings.headerHeight)}px
	                    </span>
	                  </div>
	                  <input
	                    type="range"
	                    min="44"
	                    max="140"
	                    step="2"
	                    value={uiSettings.headerHeight}
	                    onChange={(e) => updateUISettings({ headerHeight: parseInt(e.target.value) })}
	                    className="w-full cursor-pointer accent-accent"
	                  />
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="flex justify-between items-center">
	                    <label className="block text-[11px] font-medium text-white/90">Ancho del panel</label>
	                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
	                      {uiSettings.panelMaxWidthPx === 0 ? '100%' : `${Math.round(uiSettings.panelMaxWidthPx)}px`}
	                    </span>
	                  </div>
	                  <button
	                    onClick={() => updateUISettings({ panelMaxWidthPx: uiSettings.panelMaxWidthPx === 0 ? 980 : 0 })}
	                    className="w-full rounded-md border border-accent/20 px-2.5 py-2 text-[11px] text-white/80 hover:border-accent/50 transition-colors"
	                  >
	                    {uiSettings.panelMaxWidthPx === 0 ? 'Usar ancho compacto' : 'Usar ancho completo'}
	                  </button>
	                  {uiSettings.panelMaxWidthPx !== 0 && (
	                    <input
	                      type="range"
	                      min="360"
	                      max="1400"
	                      step="10"
	                      value={uiSettings.panelMaxWidthPx}
	                      onChange={(e) => updateUISettings({ panelMaxWidthPx: parseInt(e.target.value) })}
	                      className="w-full cursor-pointer accent-accent"
	                    />
	                  )}
	                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="text-[11px] font-medium text-white/90">Glass (paneles)</div>
	                  <div className="grid grid-cols-2 gap-2">
	                    <div className="space-y-1.5">
	                      <div className="flex justify-between items-center">
	                        <span className="text-[11px] text-white/80">Blur</span>
	                        <span className="text-[10px] font-mono text-white/60">{Math.round(uiSettings.glassPanelBlurPx)}px</span>
	                      </div>
	                      <input
	                        type="range"
	                        min="0"
	                        max="30"
	                        step="1"
	                        value={uiSettings.glassPanelBlurPx}
	                        onChange={(e) => updateUISettings({ glassPanelBlurPx: parseInt(e.target.value) })}
	                        className="w-full cursor-pointer accent-accent"
	                      />
	                    </div>
	                    <div className="space-y-1.5">
	                      <div className="flex justify-between items-center">
	                        <span className="text-[11px] text-white/80">Radio</span>
	                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassPanelRadiusRem.toFixed(2)}rem</span>
	                      </div>
	                      <input
	                        type="range"
	                        min="0.25"
	                        max="2.5"
	                        step="0.05"
	                        value={uiSettings.glassPanelRadiusRem}
	                        onChange={(e) => updateUISettings({ glassPanelRadiusRem: parseFloat(e.target.value) })}
	                        className="w-full cursor-pointer accent-accent"
	                      />
	                    </div>
	                  </div>
	                  <div className="grid grid-cols-2 gap-2">
	                    <div className="space-y-1.5">
	                      <div className="flex justify-between items-center">
	                        <span className="text-[11px] text-white/80">Fondo A</span>
	                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassPanelA1.toFixed(2)}</span>
	                      </div>
	                      <input
	                        type="range"
	                        min="0.05"
	                        max="0.9"
	                        step="0.01"
	                        value={uiSettings.glassPanelA1}
	                        onChange={(e) => updateUISettings({ glassPanelA1: parseFloat(e.target.value) })}
	                        className="w-full cursor-pointer accent-accent"
	                      />
	                    </div>
	                    <div className="space-y-1.5">
	                      <div className="flex justify-between items-center">
	                        <span className="text-[11px] text-white/80">Fondo B</span>
	                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassPanelA2.toFixed(2)}</span>
	                      </div>
	                      <input
	                        type="range"
	                        min="0.05"
	                        max="0.9"
	                        step="0.01"
	                        value={uiSettings.glassPanelA2}
	                        onChange={(e) => updateUISettings({ glassPanelA2: parseFloat(e.target.value) })}
	                        className="w-full cursor-pointer accent-accent"
	                      />
	                    </div>
	                  </div>
		                  <div className="space-y-1.5">
		                    <div className="flex justify-between items-center">
		                      <span className="text-[11px] text-white/80">Borde (alpha)</span>
		                      <span className="text-[10px] font-mono text-white/60">{uiSettings.glassPanelBorderAlpha.toFixed(2)}</span>
		                    </div>
		                    <input
		                      type="range"
		                      min="0"
		                      max="0.9"
		                      step="0.01"
		                      value={uiSettings.glassPanelBorderAlpha}
		                      onChange={(e) => updateUISettings({ glassPanelBorderAlpha: parseFloat(e.target.value) })}
		                      className="w-full cursor-pointer accent-accent"
		                    />
		                  </div>

		                  <div className="glass-divider opacity-50" />

		                  <div className="text-[11px] font-medium text-white/90">Glass sutil</div>
		                  <div className="grid grid-cols-2 gap-2">
		                    <div className="space-y-1.5">
		                      <div className="flex justify-between items-center">
		                        <span className="text-[11px] text-white/80">Blur</span>
		                        <span className="text-[10px] font-mono text-white/60">{Math.round(uiSettings.glassSubtleBlurPx)}px</span>
		                      </div>
		                      <input
		                        type="range"
		                        min="0"
		                        max="24"
		                        step="1"
		                        value={uiSettings.glassSubtleBlurPx}
		                        onChange={(e) => updateUISettings({ glassSubtleBlurPx: parseInt(e.target.value) })}
		                        className="w-full cursor-pointer accent-accent"
		                      />
		                    </div>
		                    <div className="space-y-1.5">
		                      <div className="flex justify-between items-center">
		                        <span className="text-[11px] text-white/80">Radio</span>
		                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassSubtleRadiusRem.toFixed(2)}rem</span>
		                      </div>
		                      <input
		                        type="range"
		                        min="0.25"
		                        max="2.5"
		                        step="0.05"
		                        value={uiSettings.glassSubtleRadiusRem}
		                        onChange={(e) => updateUISettings({ glassSubtleRadiusRem: parseFloat(e.target.value) })}
		                        className="w-full cursor-pointer accent-accent"
		                      />
		                    </div>
		                  </div>
		                  <div className="grid grid-cols-2 gap-2">
		                    <div className="space-y-1.5">
		                      <div className="flex justify-between items-center">
		                        <span className="text-[11px] text-white/80">Fondo</span>
		                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassSubtleA.toFixed(2)}</span>
		                      </div>
		                      <input
		                        type="range"
		                        min="0.05"
		                        max="0.8"
		                        step="0.01"
		                        value={uiSettings.glassSubtleA}
		                        onChange={(e) => updateUISettings({ glassSubtleA: parseFloat(e.target.value) })}
		                        className="w-full cursor-pointer accent-accent"
		                      />
		                    </div>
		                    <div className="space-y-1.5">
		                      <div className="flex justify-between items-center">
		                        <span className="text-[11px] text-white/80">Borde</span>
		                        <span className="text-[10px] font-mono text-white/60">{uiSettings.glassSubtleBorderAlpha.toFixed(2)}</span>
		                      </div>
		                      <input
		                        type="range"
		                        min="0"
		                        max="0.9"
		                        step="0.01"
		                        value={uiSettings.glassSubtleBorderAlpha}
		                        onChange={(e) => updateUISettings({ glassSubtleBorderAlpha: parseFloat(e.target.value) })}
		                        className="w-full cursor-pointer accent-accent"
		                      />
		                    </div>
		                  </div>
		                </div>

	                <div className="glass-subtle border border-accent/20 p-3 space-y-3">
	                  <div className="text-[11px] font-medium text-white/90">Versículos (idle / enfocado / activo)</div>
	                  <div className="grid grid-cols-1 gap-3">
	                    {VERSE_STYLE_ROWS.map((row) => (
		                      <div key={row.key} className="rounded-md border border-accent/10 bg-black/30 p-2.5 space-y-2">
	                        <div className="flex items-center justify-between">
	                          <div className="text-[11px] text-white/85 font-semibold">{row.label}</div>
	                          <div
	                            className="h-6 w-10 rounded border border-white/10"
	                            style={{
	                              background:
	                                row.key === 'active'
	                                  ? hexToRgba(uiSettings.verseActiveBg, uiSettings.verseActiveBgAlpha)
	                                  : row.key === 'focused'
	                                    ? hexToRgba(uiSettings.verseFocusedBg, uiSettings.verseFocusedBgAlpha)
	                                    : hexToRgba(uiSettings.verseIdleBg, uiSettings.verseIdleBgAlpha),
	                            }}
	                            title="Preview"
	                          />
	                        </div>

	                        <div className="grid grid-cols-2 gap-2">
	                          <div className="space-y-1.5">
	                            <label className="block text-[10px] text-white/70">Fondo</label>
	                            <div className="flex items-center gap-2">
	                              <input
	                                type="color"
	                                value={uiSettings[row.bg]}
	                                onChange={(e) => updateUISettings({ [row.bg]: e.target.value } as Partial<UISettings>)}
	                                className="w-9 h-9 rounded cursor-pointer border border-accent/20 bg-transparent"
	                              />
	                              <input
	                                type="range"
	                                min="0"
	                                max="1"
	                                step="0.05"
	                                value={uiSettings[row.bga]}
	                                onChange={(e) =>
	                                  updateUISettings({ [row.bga]: parseFloat(e.target.value) } as Partial<UISettings>)
	                                }
	                                className="w-full cursor-pointer accent-accent"
	                              />
	                            </div>
	                          </div>
	                          <div className="space-y-1.5">
	                            <label className="block text-[10px] text-white/70">Borde</label>
	                            <div className="flex items-center gap-2">
	                              <input
	                                type="color"
	                                value={uiSettings[row.br]}
	                                onChange={(e) => updateUISettings({ [row.br]: e.target.value } as Partial<UISettings>)}
	                                className="w-9 h-9 rounded cursor-pointer border border-accent/20 bg-transparent"
	                              />
	                              <input
	                                type="range"
	                                min="0"
	                                max="1"
	                                step="0.05"
	                                value={uiSettings[row.bra]}
	                                onChange={(e) =>
	                                  updateUISettings({ [row.bra]: parseFloat(e.target.value) } as Partial<UISettings>)
	                                }
	                                className="w-full cursor-pointer accent-accent"
	                              />
	                            </div>
	                          </div>
	                        </div>
		                      </div>
	                    ))}
	                  </div>
	                </div>
	              </div>

              {/* ========== CONFIGURACIÓN DE TRANSMISIÓN (DISPLAY / OBS) ========== */}
              <div className="rounded-lg glass-panel border border-accent/20 p-3 space-y-4 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye style={{ width: iconPx, height: iconPx }} className="text-accent" />
                      Configuración de Transmisión
                    </h3>
                    <p className="text-[10px] text-white/50">Afecta lo que se muestra en OBS/Display</p>
                  </div>
                </div>

                {/* --- TEXTO DEL VERSO --- */}
                <details className="group" open>
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Texto del Verso</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    {/* Tamaño de letra */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-white/90">Tamaño de fuente</label>
                        <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{config.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        step="1"
                        value={config.fontSize}
                        onChange={(e) => handleConfigChange({ fontSize: parseInt(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Color del texto */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Color del texto</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => handleConfigChange({ textColor: e.target.value })}
                          className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.textColor}
                          onChange={(e) => handleConfigChange({ textColor: e.target.value })}
                          className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                        />
                      </div>
                    </div>

                    {/* Alineación de texto */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Alineación del texto</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'left', label: 'Izquierda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Derecha' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleConfigChange({ textAlign: option.value as 'left' | 'center' | 'right' })}
                            className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                              config.textAlign === option.value
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fuente */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Tipo de fuente</label>
                      <select
                        value={config.fontFamily}
                        onChange={(e) => handleConfigChange({ fontFamily: e.target.value })}
                        className="w-full glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50 [&>option]:bg-black"
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Georgia', serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                        <option value="'Verdana', sans-serif">Verdana</option>
                        <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                      </select>
                    </div>

                    {/* Sombra y normalizar saltos */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleConfigChange({ textShadow: !config.textShadow })}
                        className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
                          config.textShadow
                            ? 'bg-accent/15 border-accent/40 text-white'
                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {config.textShadow ? 'Sombra: ON' : 'Sombra: OFF'}
                      </button>
                      <button
                        onClick={() => handleConfigChange({ normalizeLineBreaks: !config.normalizeLineBreaks })}
                        className={`rounded-md border px-2.5 py-2 text-[11px] transition-colors ${
                          config.normalizeLineBreaks
                            ? 'bg-accent/15 border-accent/40 text-white'
                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                        title="Une saltos de línea simples, mantiene párrafos"
                      >
                        {config.normalizeLineBreaks ? 'Unir saltos: ON' : 'Unir saltos: OFF'}
                      </button>
                    </div>
                  </div>
                </details>

                {/* --- TÍTULO DEL HIMNO --- */}
                <details className="group">
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Título del Himno</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    {/* Mostrar título */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-white/90">Mostrar título</label>
                      <button
                        onClick={() => handleConfigChange({ showTitle: !config.showTitle })}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                          config.showTitle
                            ? 'bg-accent/15 border-accent/40 text-white'
                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {config.showTitle ? 'Visible' : 'Oculto'}
                      </button>
                    </div>

                    {config.showTitle && (
                      <>
                        {/* Tamaño del título */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-medium text-white/90">Tamaño</label>
                            <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{config.titleFontSize}px</span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="60"
                            step="1"
                            value={config.titleFontSize}
                            onChange={(e) => handleConfigChange({ titleFontSize: parseInt(e.target.value) })}
                            className="w-full cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Color del título */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-white/90">Color</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={config.titleColor}
                              onChange={(e) => handleConfigChange({ titleColor: e.target.value })}
                              className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.titleColor}
                              onChange={(e) => handleConfigChange({ titleColor: e.target.value })}
                              className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </details>

                {/* --- PANEL/CONTENEDOR --- */}
                <details className="group">
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Panel Decorativo</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    {/* Mostrar panel */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-white/90">Mostrar panel</label>
                      <button
                        onClick={() => handleConfigChange({ showPanel: !config.showPanel })}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                          config.showPanel
                            ? 'bg-accent/15 border-accent/40 text-white'
                            : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {config.showPanel ? 'Visible' : 'Oculto'}
                      </button>
                    </div>

                    {config.showPanel && (
                      <>
                        {/* Color del panel */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-white/90">Color de fondo</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={config.panelBackground}
                              onChange={(e) => handleConfigChange({ panelBackground: e.target.value })}
                              className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.panelBackground}
                              onChange={(e) => handleConfigChange({ panelBackground: e.target.value })}
                              className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                            />
                          </div>
                        </div>

                        {/* Opacidad */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-medium text-white/90">Opacidad</label>
                            <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{Math.round(config.panelOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.panelOpacity}
                            onChange={(e) => handleConfigChange({ panelOpacity: parseFloat(e.target.value) })}
                            className="w-full cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Blur */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-medium text-white/90">Desenfoque</label>
                            <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{config.panelBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            step="1"
                            value={config.panelBlur}
                            onChange={(e) => handleConfigChange({ panelBlur: parseInt(e.target.value) })}
                            className="w-full cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Color del borde */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-white/90">Color del borde</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={config.panelBorderColor}
                              onChange={(e) => handleConfigChange({ panelBorderColor: e.target.value })}
                              className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.panelBorderColor}
                              onChange={(e) => handleConfigChange({ panelBorderColor: e.target.value })}
                              className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                            />
                          </div>
                        </div>

                        {/* Gradiente */}
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-white/90">Gradiente visual</label>
                          <button
                            onClick={() => handleConfigChange({ showBackgroundGradient: !config.showBackgroundGradient })}
                            className={`rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                              config.showBackgroundGradient
                                ? 'bg-accent/15 border-accent/40 text-white'
                                : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                            }`}
                          >
                            {config.showBackgroundGradient ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </details>

                {/* --- FONDO DE PÁGINA (OBS) --- */}
                <details className="group">
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Fondo de Página (Display)</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    <p className="text-[10px] text-white/50 mb-2">
                      Para OBS/Captura de ventana, usa opacidad 0% (transparente). Para previsualización o fondo sólido, aumenta la opacidad.
                    </p>

                    {/* Color de fondo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Color de fondo</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={config.pageBackgroundColor}
                          onChange={(e) => handleConfigChange({ pageBackgroundColor: e.target.value })}
                          className="w-9 h-9 rounded cursor-pointer border border-accent/30 bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.pageBackgroundColor}
                          onChange={(e) => handleConfigChange({ pageBackgroundColor: e.target.value })}
                          className="flex-1 glass-subtle border border-accent/20 rounded-md px-2.5 py-2 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-accent/50"
                        />
                      </div>
                    </div>

                    {/* Opacidad */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-white/90">Opacidad</label>
                        <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
                          {Math.round(config.pageBackgroundOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.pageBackgroundOpacity}
                        onChange={(e) => handleConfigChange({ pageBackgroundOpacity: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Presets rápidos */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleConfigChange({ pageBackgroundOpacity: 0 })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                          config.pageBackgroundOpacity === 0
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                        }`}
                      >
                        Transparente
                      </button>
                      <button
                        onClick={() => handleConfigChange({ pageBackgroundColor: '#000000', pageBackgroundOpacity: 1 })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                          config.pageBackgroundOpacity === 1 && config.pageBackgroundColor === '#000000'
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                        }`}
                      >
                        Negro
                      </button>
                      <button
                        onClick={() => handleConfigChange({ pageBackgroundColor: '#00FF00', pageBackgroundOpacity: 1 })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                          config.pageBackgroundOpacity === 1 && config.pageBackgroundColor === '#00FF00'
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                        }`}
                      >
                        Chroma
                      </button>
                    </div>
                  </div>
                </details>

                {/* --- POSICIONAMIENTO --- */}
                <details className="group">
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Posición y Márgenes</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    {/* Posición vertical */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Posición vertical</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'top', label: 'Arriba' },
                          { value: 'middle', label: 'Centro' },
                          { value: 'bottom', label: 'Abajo' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleConfigChange({ position: option.value as 'top' | 'middle' | 'bottom' })}
                            className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                              config.position === option.value
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alineación horizontal */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/90">Alineación horizontal</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'left', label: 'Izquierda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Derecha' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleConfigChange({ horizontalAlignment: option.value as 'left' | 'center' | 'right' })}
                            className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                              config.horizontalAlignment === option.value
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Offsets */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Offset V</label>
                          <span className="text-[10px] font-mono text-white/60">{config.verticalOffset}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          step="5"
                          value={config.verticalOffset}
                          onChange={(e) => handleConfigChange({ verticalOffset: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Offset H</label>
                          <span className="text-[10px] font-mono text-white/60">{config.horizontalOffset}px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          step="5"
                          value={config.horizontalOffset}
                          onChange={(e) => handleConfigChange({ horizontalOffset: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                    </div>

                    {/* Márgenes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Margen ↑</label>
                          <span className="text-[10px] font-mono text-white/60">{config.marginTop}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={config.marginTop}
                          onChange={(e) => handleConfigChange({ marginTop: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Margen ↓</label>
                          <span className="text-[10px] font-mono text-white/60">{config.marginBottom}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={config.marginBottom}
                          onChange={(e) => handleConfigChange({ marginBottom: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Margen ←</label>
                          <span className="text-[10px] font-mono text-white/60">{config.marginLeft}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={config.marginLeft}
                          onChange={(e) => handleConfigChange({ marginLeft: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-medium text-white/90">Margen →</label>
                          <span className="text-[10px] font-mono text-white/60">{config.marginRight}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={config.marginRight}
                          onChange={(e) => handleConfigChange({ marginRight: parseInt(e.target.value) })}
                          className="w-full cursor-pointer accent-accent"
                        />
                      </div>
                    </div>
                  </div>
                </details>

                {/* --- DIMENSIONES --- */}
                <details className="group">
                  <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                    <span className="text-[11px] font-bold text-accent">Dimensiones</span>
                    <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                    {/* Padding interno */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-white/90">Padding interno</label>
                        <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{config.padding}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="60"
                        step="2"
                        value={config.padding}
                        onChange={(e) => handleConfigChange({ padding: parseInt(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Ancho máximo */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-white/90">Ancho máximo</label>
                        <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{config.maxWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="180"
                        max="3840"
                        step="50"
                        value={config.maxWidth}
                        onChange={(e) => handleConfigChange({ maxWidth: parseInt(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>

                    {/* Presets de ancho */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleConfigChange({ maxWidth: 900, textAlign: 'center', horizontalAlignment: 'center' })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                          config.maxWidth <= 1100 && config.textAlign === 'center'
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                        }`}
                      >
                        Angosto (centrado)
                      </button>
                      <button
                        onClick={() => handleConfigChange({ maxWidth: 1800, textAlign: 'left', horizontalAlignment: 'center' })}
                        className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                          config.maxWidth >= 1400 && config.textAlign === 'left'
                            ? 'bg-accent/20 border-accent/50 text-accent'
                            : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                        }`}
                      >
                        Ancho (expandido)
                      </button>
                    </div>
                  </div>
                </details>
              </div>

              {/* ── PROYECCIÓN ──────────────────────────────── */}
              <div className="pt-2 border-t border-accent/10">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="text-accent" style={{ width: iconPxSm, height: iconPxSm }} />
                  <span className="text-[12px] font-bold text-white">Vista de Proyección</span>
                  <a
                    href="/projection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10px] text-accent/70 hover:text-accent underline"
                  >
                    Abrir
                  </a>
                </div>

                {/* Enable toggle */}
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] text-white/80">Activar proyección</label>
                  <button
                    onClick={() => updateProjectionConfig({ enabled: !projectionConfig.enabled })}
                    className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                      projectionConfig.enabled
                        ? 'bg-accent/20 border-accent/50 text-accent'
                        : 'bg-black/30 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {projectionConfig.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {projectionConfig.enabled && (
                  <div className="space-y-3">
                    {/* Background toggle */}
                    <details className="group">
                      <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                        <span className="text-[11px] font-bold text-accent">Fondos</span>
                        <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-white/80">Mostrar fondo</label>
                          <button
                            onClick={() => updateProjectionConfig({ showBackground: !projectionConfig.showBackground })}
                            className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                              projectionConfig.showBackground
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'bg-black/30 border-white/10 text-white/50'
                            }`}
                          >
                            {projectionConfig.showBackground ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {projectionConfig.showBackground && (
                          <>
                            {/* Category */}
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-medium text-white/70">Categoría</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(['all', ...Object.keys(BACKGROUND_CATEGORIES)] as Array<BackgroundCategory | 'all'>).map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => updateProjectionConfig({ backgroundCategory: cat })}
                                    className={`rounded-md border px-2 py-1.5 text-[10px] transition-colors ${
                                      projectionConfig.backgroundCategory === cat
                                        ? 'bg-accent/20 border-accent/50 text-accent'
                                        : 'bg-black/30 border-white/10 text-white/50 hover:border-white/20'
                                    }`}
                                  >
                                    {cat === 'all' ? 'Todos' : BACKGROUND_CATEGORIES[cat as BackgroundCategory]}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Mode */}
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-medium text-white/70">Modo de cambio</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(['random', 'cycle', 'fixed'] as const).map((mode) => (
                                  <button
                                    key={mode}
                                    onClick={() => updateProjectionConfig({ backgroundMode: mode })}
                                    className={`rounded-md border px-2 py-1.5 text-[10px] transition-colors ${
                                      projectionConfig.backgroundMode === mode
                                        ? 'bg-accent/20 border-accent/50 text-accent'
                                        : 'bg-black/30 border-white/10 text-white/50 hover:border-white/20'
                                    }`}
                                  >
                                    {mode === 'random' ? 'Aleatorio' : mode === 'cycle' ? 'Secuencial' : 'Fijo'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Fixed index picker */}
                            {projectionConfig.backgroundMode === 'fixed' && (() => {
                              const pool = PROJECTION_BACKGROUNDS.filter(
                                (b) => projectionConfig.backgroundCategory === 'all' || b.category === projectionConfig.backgroundCategory,
                              );
                              return (
                                <div className="space-y-1.5">
                                  <label className="block text-[11px] font-medium text-white/70">Fondo fijo</label>
                                  <select
                                    value={projectionConfig.backgroundIndex}
                                    onChange={(e) => updateProjectionConfig({ backgroundIndex: parseInt(e.target.value) })}
                                    className="w-full rounded-md glass-subtle border border-accent/20 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 [&>option]:bg-black"
                                  >
                                    {pool.map((bg, idx) => (
                                      <option key={bg.id} value={idx}>{bg.name}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })()}

                            {/* Change on new hymn */}
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-white/80">Cambiar al nuevo himno</label>
                              <button
                                onClick={() => updateProjectionConfig({ backgroundChangeOnHymn: !projectionConfig.backgroundChangeOnHymn })}
                                className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                                  projectionConfig.backgroundChangeOnHymn
                                    ? 'bg-accent/20 border-accent/50 text-accent'
                                    : 'bg-black/30 border-white/10 text-white/50'
                                }`}
                              >
                                {projectionConfig.backgroundChangeOnHymn ? 'ON' : 'OFF'}
                              </button>
                            </div>

                            {/* Overlay opacity */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <label className="text-[11px] font-medium text-white/90">Oscuridad del fondo</label>
                                <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
                                  {Math.round(projectionConfig.backgroundOverlayOpacity * 100)}%
                                </span>
                              </div>
                              <input
                                type="range" min="0" max="0.85" step="0.05"
                                value={projectionConfig.backgroundOverlayOpacity}
                                onChange={(e) => updateProjectionConfig({ backgroundOverlayOpacity: parseFloat(e.target.value) })}
                                className="w-full cursor-pointer accent-accent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </details>

                    {/* Text settings */}
                    <details className="group">
                      <summary className="cursor-pointer select-none flex items-center justify-between py-2 px-3 rounded-md glass-subtle border border-accent/20 hover:border-accent/40 transition-colors">
                        <span className="text-[11px] font-bold text-accent">Texto</span>
                        <span className="text-white/50 text-[10px] group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-2 space-y-3 p-3 rounded-md glass-subtle border border-accent/10">
                        {/* Font size */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-medium text-white/90">Tamaño de letra</label>
                            <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{projectionConfig.fontSize}px</span>
                          </div>
                          <input type="range" min="24" max="96" step="2"
                            value={projectionConfig.fontSize}
                            onChange={(e) => updateProjectionConfig({ fontSize: parseInt(e.target.value) })}
                            className="w-full cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Text align */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-medium text-white/70">Alineación</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['left', 'center', 'right'] as const).map((a) => (
                              <button key={a}
                                onClick={() => updateProjectionConfig({ textAlign: a })}
                                className={`rounded-md border px-2 py-1.5 text-[10px] transition-colors ${
                                  projectionConfig.textAlign === a
                                    ? 'bg-accent/20 border-accent/50 text-accent'
                                    : 'bg-black/30 border-white/10 text-white/50 hover:border-white/20'
                                }`}
                              >
                                {a === 'left' ? 'Izq.' : a === 'center' ? 'Centro' : 'Der.'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Text shadow */}
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-white/80">Sombra de texto</label>
                          <button
                            onClick={() => updateProjectionConfig({ textShadow: !projectionConfig.textShadow })}
                            className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                              projectionConfig.textShadow
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'bg-black/30 border-white/10 text-white/50'
                            }`}
                          >
                            {projectionConfig.textShadow ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* Max width */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[11px] font-medium text-white/90">Ancho máximo</label>
                            <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">{projectionConfig.maxWidth}px</span>
                          </div>
                          <input type="range" min="400" max="1920" step="40"
                            value={projectionConfig.maxWidth}
                            onChange={(e) => updateProjectionConfig({ maxWidth: parseInt(e.target.value) })}
                            className="w-full cursor-pointer accent-accent"
                          />
                        </div>

                        {/* Show title */}
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-white/80">Mostrar nombre del himno</label>
                          <button
                            onClick={() => updateProjectionConfig({ showTitle: !projectionConfig.showTitle })}
                            className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                              projectionConfig.showTitle
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'bg-black/30 border-white/10 text-white/50'
                            }`}
                          >
                            {projectionConfig.showTitle ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* Show panel */}
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] text-white/80">Panel detrás del texto</label>
                          <button
                            onClick={() => updateProjectionConfig({ showPanel: !projectionConfig.showPanel })}
                            className={`px-3 py-1 rounded-md border text-[11px] transition-colors ${
                              projectionConfig.showPanel
                                ? 'bg-accent/20 border-accent/50 text-accent'
                                : 'bg-black/30 border-white/10 text-white/50'
                            }`}
                          >
                            {projectionConfig.showPanel ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {projectionConfig.showPanel && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[11px] font-medium text-white/90">Opacidad del panel</label>
                              <span className="text-[10px] font-mono text-white/60">{Math.round(projectionConfig.panelOpacity * 100)}%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05"
                              value={projectionConfig.panelOpacity}
                              onChange={(e) => updateProjectionConfig({ panelOpacity: parseFloat(e.target.value) })}
                              className="w-full cursor-pointer accent-accent"
                            />
                          </div>
                        )}
                      </div>
                    </details>

                    {/* Reset projection */}
                    <button
                      onClick={() => setProjectionConfig(DEFAULT_PROJECTION_CONFIG)}
                      className="w-full rounded-md glass-subtle border border-white/10 px-3 py-2 text-[11px] text-white/70 hover:border-accent/30 hover:text-white transition-colors"
                    >
                      Restaurar proyección por defecto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Templates */}
          {activeTab === 'templates' && (
            <div className="h-full overflow-y-auto p-3 space-y-4 ctrl-scroll">
              {uiSettings.sectionHeadersVisible && (
                <div className={`rounded-lg glass-panel border border-accent/20 flex items-center gap-2.5 relative z-10 ${sectionHeader.pad}`}>
                  <div className={`${sectionHeader.iconWrap} bg-accent/20 rounded-md`}>
                    <Palette className="text-accent" style={{ width: iconPx, height: iconPx }} />
                  </div>
                  <div>
                    <h2 className={`${sectionHeader.title} font-bold text-white`}>Plantillas</h2>
                    <p className={`${sectionHeader.subtitle} text-white/50`}>Estilos visuales predefinidos</p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-white/60 px-1">
                Selecciona una plantilla para aplicar un estilo visual completo al display. Puedes personalizar más en Ajustes.
              </p>

              {/* Save current config as custom template */}
              {!showSaveTemplateForm ? (
                <button
                  onClick={() => { setShowSaveTemplateForm(true); setNewTemplateName(''); }}
                  className="w-full rounded-md glass-subtle border border-accent/30 px-3 py-2 text-[11px] text-accent hover:border-accent/60 hover:bg-accent/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bookmark style={{ width: iconPxSm, height: iconPxSm }} />
                  Guardar configuración actual como plantilla
                </button>
              ) : (
                <div className="glass-subtle border border-accent/40 rounded-md p-3 space-y-2">
                  <p className="text-[10px] text-white/60">Nombre para esta plantilla:</p>
                  <input
                    type="text"
                    autoFocus
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveCustomTemplate(newTemplateName); }
                      if (e.key === 'Escape') { setShowSaveTemplateForm(false); setNewTemplateName(''); }
                    }}
                    placeholder="Ej: Mi estilo domingo"
                    className="w-full bg-black/40 border border-accent/20 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveCustomTemplate(newTemplateName)}
                      className="flex-1 rounded bg-accent/20 border border-accent/40 px-2 py-1.5 text-[11px] text-accent hover:bg-accent/30 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => { setShowSaveTemplateForm(false); setNewTemplateName(''); }}
                      className="flex-1 rounded bg-black/30 border border-white/10 px-2 py-1.5 text-[11px] text-white/60 hover:border-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Custom (saved) templates */}
              {customTemplates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider px-1">Mis plantillas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {customTemplates.map((template) => (
                      <div key={template.id} className="relative group">
                        <button
                          onClick={() => {
                            const newConfig = applyTemplate(template);
                            setConfig(newConfig);
                            broadcaster.sendConfig(newConfig);
                            if (selectedHymn && activeVerseIndex !== null) {
                              const display: HymnDisplay = {
                                hymnbookId,
                                hymnNumber: selectedHymn.number,
                                hymnTitle: selectedHymn.title,
                                verseIndex: activeVerseIndex,
                                verseText: selectedHymn.verses[activeVerseIndex],
                                config: newConfig,
                              };
                              broadcaster.sendDisplay(display);
                            }
                          }}
                          className="w-full rounded-lg bg-black/40 border border-accent/30 p-3 text-left transition-all hover:border-accent/60 hover:bg-accent/5 focus:outline-none focus:ring-1 focus:ring-accent/50"
                        >
                          <div
                            className="h-10 rounded-md mb-2 flex items-center justify-center overflow-hidden border border-white/10"
                            style={{
                              backgroundColor:
                                template.preview.backgroundColor === 'transparent'
                                  ? '#1a1a1a'
                                  : template.preview.backgroundColor,
                              backgroundImage:
                                template.preview.backgroundColor === 'transparent'
                                  ? 'repeating-linear-gradient(45deg, #222 0, #222 10px, #1a1a1a 10px, #1a1a1a 20px)'
                                  : 'none',
                            }}
                          >
                            <span
                              className="text-xs font-medium truncate px-2"
                              style={{ color: template.preview.textColor }}
                            >
                              {template.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full border border-white/20 flex-none"
                              style={{ backgroundColor: template.preview.accentColor }}
                            />
                            <span className="text-[11px] font-medium text-white truncate">{template.name}</span>
                          </div>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => deleteCustomTemplate(template.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 opacity-0 group-hover:opacity-100 transition-all"
                          title="Eliminar plantilla"
                        >
                          <Trash2 style={{ width: 10, height: 10 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template categories */}
              {(Object.keys(TEMPLATE_CATEGORIES) as Array<keyof typeof TEMPLATE_CATEGORIES>).map((category) => {
                const categoryTemplates = DISPLAY_TEMPLATES.filter(t => t.category === category);
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider px-1">
                      {TEMPLATE_CATEGORIES[category]}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            const newConfig = applyTemplate(template);
                            setConfig(newConfig);
                            broadcaster.sendConfig(newConfig);
                            // Re-transmit if there's currently a verse on display
                            if (selectedHymn && activeVerseIndex !== null) {
                              const display: HymnDisplay = {
                                hymnbookId,
                                hymnNumber: selectedHymn.number,
                                hymnTitle: selectedHymn.title,
                                verseIndex: activeVerseIndex,
                                verseText: selectedHymn.verses[activeVerseIndex],
                                config: newConfig,
                              };
                              broadcaster.sendDisplay(display);
                            }
                          }}
                          className="group relative rounded-lg bg-black/40 border border-accent/20 p-3 text-left transition-all hover:border-accent/50 hover:bg-accent/5 focus:outline-none focus:ring-1 focus:ring-accent/50"
                        >
                          {/* Preview bar */}
                          <div 
                            className="h-12 rounded-md mb-2 flex items-center justify-center overflow-hidden border border-white/10"
                            style={{ 
                              backgroundColor: template.preview.backgroundColor === 'transparent' 
                                ? '#1a1a1a' 
                                : template.preview.backgroundColor,
                              backgroundImage: template.preview.backgroundColor === 'transparent'
                                ? 'repeating-linear-gradient(45deg, #222 0, #222 10px, #1a1a1a 10px, #1a1a1a 20px)'
                                : 'none'
                            }}
                          >
                            <span 
                              className="text-sm font-medium truncate px-2"
                              style={{ 
                                color: template.preview.textColor,
                                textShadow: template.config.textShadow ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none'
                              }}
                            >
                              Himno 123
                            </span>
                          </div>

                          {/* Template info */}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: template.preview.accentColor }}
                              />
                              <span className="text-[11px] font-medium text-white truncate">
                                {template.name}
                              </span>
                            </div>
                            <p className="text-[9px] text-white/50 leading-tight line-clamp-2">
                              {template.description}
                            </p>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 rounded-lg bg-accent/0 group-hover:bg-accent/5 transition-colors pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Reset to default button */}
              <div className="pt-2 border-t border-accent/10">
                <button
                  onClick={() => {
                    setConfig(DEFAULT_CONFIG);
                    broadcaster.sendConfig(DEFAULT_CONFIG);
                    if (selectedHymn && activeVerseIndex !== null) {
                      const display: HymnDisplay = {
                        hymnbookId,
                        hymnNumber: selectedHymn.number,
                        hymnTitle: selectedHymn.title,
                        verseIndex: activeVerseIndex,
                        verseText: selectedHymn.verses[activeVerseIndex],
                        config: DEFAULT_CONFIG,
                      };
                      broadcaster.sendDisplay(display);
                    }
                  }}
                  className="w-full rounded-md glass-subtle border border-white/10 px-3 py-2 text-[11px] text-white/70 hover:border-accent/30 hover:text-white transition-colors"
                >
                  Restaurar configuración por defecto
                </button>
              </div>

              {/* ────── Projection Templates ────── */}
              <div className="pt-4 border-t border-accent/10 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor style={{ width: iconPxSm, height: iconPxSm }} className="text-accent" />
                  <span className="text-[12px] font-bold text-white">Plantillas de Proyección</span>
                </div>
                <p className="text-[11px] text-white/60 px-1 mb-3">
                  Estilos centrados con fondos visuales para pantalla de proyección.
                </p>
                {(Object.keys(PROJECTION_TEMPLATE_CATEGORIES) as Array<ProjectionTemplate['category']>).map(category => {
                  const tpls = PROJECTION_TEMPLATES.filter(t => t.category === category);
                  if (!tpls.length) return null;
                  return (
                    <div key={category} className="space-y-2 mb-4">
                      <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                        {PROJECTION_TEMPLATE_CATEGORIES[category]}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {tpls.map(template => (
                          <button
                            key={template.id}
                            onClick={() => setProjectionConfig(applyProjectionTemplate(template))}
                            className="group rounded-lg glass-subtle border border-accent/20 p-2 text-left hover:border-accent/50 transition-all"
                          >
                            <div
                              className="w-full h-10 rounded mb-1.5 flex items-end justify-center pb-1.5 overflow-hidden"
                              style={{ background: template.preview.gradient }}
                            >
                              <div className="flex flex-col items-center gap-[3px]">
                                <div className="h-[3px] rounded" style={{ width: '32px', backgroundColor: template.preview.accentColor }} />
                                <div className="h-[5px] rounded" style={{ width: '48px', backgroundColor: template.preview.textColor, opacity: 0.9 }} />
                                <div className="h-[5px] rounded" style={{ width: '40px', backgroundColor: template.preview.textColor, opacity: 0.65 }} />
                              </div>
                            </div>
                            <p className="text-[11px] font-semibold text-white leading-tight truncate">{template.name}</p>
                            <p className="text-[10px] text-white/50 leading-tight line-clamp-2">{template.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => setProjectionConfig(DEFAULT_PROJECTION_CONFIG)}
                  className="w-full rounded-md glass-subtle border border-white/10 px-3 py-2 text-[11px] text-white/70 hover:border-accent/30 hover:text-white transition-colors"
                >
                  Restaurar proyección por defecto
                </button>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Bottom nav (fixed) */}
        {uiSettings.showBottomNav && (
          <div className="flex-none z-20 glass-panel border-t border-accent/20 p-2 pb-safe relative">
            <div className="max-w-3xl mx-auto flex items-center justify-around gap-1.5">
              <div className="relative flex-1 group">
                <button
                  onClick={() => { setActiveTab('search'); }}
                  className={`w-full flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
                    activeTab === 'search' 
                      ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                      : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
                  }`}
                >
                  <Search style={{ width: iconPx, height: iconPx }} className="mb-0.5" />
                  <span className="text-[9px]">Buscar</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-black/90 border border-accent/30 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="text-accent font-mono">Ctrl + 1</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </div>

              <div className="relative flex-1 group">
                <button
                  onClick={() => { if (selectedHymn) { setActiveTab('hymn'); } }}
                  disabled={!selectedHymn}
                  className={`w-full flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
                    activeTab === 'hymn' 
                      ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                      : selectedHymn 
                        ? 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30' 
                        : 'bg-transparent border-transparent text-white/20 cursor-not-allowed'
                  }`}
                >
                  <Music style={{ width: iconPx, height: iconPx }} className="mb-0.5" />
                  <span className="text-[9px]">Himno</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-black/90 border border-accent/30 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="text-accent font-mono">Ctrl + 2</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </div>

              <div className="relative flex-1 group">
                <button
                  onClick={() => { setActiveTab('saved'); }}
                  className={`w-full flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
                    activeTab === 'saved' 
                      ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                      : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
                  }`}
                >
                  <ListMusic style={{ width: iconPx, height: iconPx }} className="mb-0.5" />
                  <span className="text-[9px]">Guardados</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-black/90 border border-accent/30 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="text-accent font-mono">Ctrl + 3</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </div>

              <div className="relative flex-1 group">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`w-full flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
                    activeTab === 'templates' 
                      ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                      : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
                  }`}
                >
                  <Palette style={{ width: iconPx, height: iconPx }} className="mb-0.5" />
                  <span className="text-[9px]">Plantillas</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-black/90 border border-accent/30 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="text-accent font-mono">Ctrl + 4</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </div>

              <div className="relative flex-1 group">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
                    activeTab === 'settings' 
                      ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                      : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
                  }`}
                >
                  <Sliders style={{ width: iconPx, height: iconPx }} className="mb-0.5" />
                  <span className="text-[9px]">Ajustes</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-black/90 border border-accent/30 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="text-accent font-mono">Ctrl + 5</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
