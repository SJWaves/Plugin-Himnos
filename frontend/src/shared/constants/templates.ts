/**
 * Display templates for quick visual customization.
 * These provide predefined configurations that users can apply with one click.
 *
 * Rules:
 * - pageBackgroundOpacity is always 0 (transparent full overlay — no colored backgrounds)
 * - showPanel controls a text-area background only (tight strip behind text)
 * - maxWidth uses DEFAULT_CONFIG value (9999) for full-width layout
 * - Horizontal alignment handled via textAlign, not container positioning
 */

import { DisplayConfig, DEFAULT_CONFIG, ProjectionConfig, DEFAULT_PROJECTION_CONFIG } from '../../app/utils/broadcast';

export interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'contrast' | 'elegant' | 'branded' | 'custom';
  preview: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  config: Partial<DisplayConfig>;
}

export const DISPLAY_TEMPLATES: DisplayTemplate[] = [
  // ============ MINIMAL ============
  {
    id: 'minimal-transparent',
    name: 'Solo texto',
    description: 'Texto blanco sin fondo, ancho completo',
    category: 'minimal',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#FFFFFF',
      accentColor: '#E5E7EB',
    },
    config: {
      fontSize: 46,
      textColor: '#FFFFFF',
      textShadow: true,
      textAlign: 'center',
      showTitle: false,
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 50,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'minimal-gray',
    name: 'Minimalista Gris',
    description: 'Texto gris suave sin fondo',
    category: 'minimal',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#9CA3AF',
      accentColor: '#6B7280',
    },
    config: {
      fontSize: 42,
      textColor: '#9CA3AF',
      textShadow: false,
      textAlign: 'center',
      showTitle: false,
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 60,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },

  // ============ ALTO CONTRASTE ============
  {
    id: 'contrast-dark-strip',
    name: 'Franja Oscura',
    description: 'Franja negra detrás del texto, ancho completo',
    category: 'contrast',
    preview: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#FBBF24',
    },
    config: {
      fontSize: 48,
      textColor: '#FFFFFF',
      textShadow: false,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 24,
      titleColor: '#FBBF24',
      showPanel: true,
      panelBackground: '#000000',
      panelOpacity: 0.92,
      panelBorderColor: '#FBBF24',
      panelBlur: 0,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 24,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'contrast-light-strip',
    name: 'Franja Clara',
    description: 'Franja blanca con texto oscuro, ancho completo',
    category: 'contrast',
    preview: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      accentColor: '#3B82F6',
    },
    config: {
      fontSize: 46,
      textColor: '#1F2937',
      textShadow: false,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 22,
      titleColor: '#3B82F6',
      showPanel: true,
      panelBackground: '#FFFFFF',
      panelOpacity: 0.96,
      panelBorderColor: '#3B82F6',
      panelBlur: 0,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 24,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },

  // ============ ELEGANTE ============
  {
    id: 'elegant-gold',
    name: 'Elegante Dorado',
    description: 'Texto con sombra y acentos dorados, sin fondo',
    category: 'elegant',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#F5F5F5',
      accentColor: '#C5A021',
    },
    config: {
      fontSize: 48,
      fontFamily: 'Georgia, serif',
      textColor: '#F5F5F5',
      textShadow: true,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 26,
      titleColor: '#C5A021',
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 50,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'elegant-glass',
    name: 'Panel Glass Oscuro',
    description: 'Franja semi-transparente con blur, ancho completo',
    category: 'elegant',
    preview: {
      backgroundColor: '#0A0A0A',
      textColor: '#F5F5F5',
      accentColor: '#C5A021',
    },
    config: {
      fontSize: 46,
      fontFamily: 'Georgia, serif',
      textColor: '#F5F5F5',
      textShadow: true,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 24,
      titleColor: '#C5A021',
      showPanel: true,
      panelBackground: '#000000',
      panelOpacity: 0.70,
      panelBorderColor: '#C5A021',
      panelBlur: 20,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 28,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'elegant-blue',
    name: 'Acento Azul',
    description: 'Texto claro con acentos azules, sin fondo',
    category: 'elegant',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#E2E8F0',
      accentColor: '#60A5FA',
    },
    config: {
      fontSize: 46,
      fontFamily: 'Georgia, serif',
      textColor: '#E2E8F0',
      textShadow: true,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 24,
      titleColor: '#60A5FA',
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 50,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },

  // ============ BRANDED / CON NOMBRE ============
  {
    id: 'branded-title-strip',
    name: 'Nombre del Himno',
    description: 'Nombre del himno destacado, franja inferior completa',
    category: 'branded',
    preview: {
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      accentColor: '#10B981',
    },
    config: {
      fontSize: 44,
      textColor: '#FFFFFF',
      textShadow: false,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 30,
      titleColor: '#10B981',
      showPanel: true,
      panelBackground: '#000000',
      panelOpacity: 0.85,
      panelBorderColor: '#10B981',
      panelBlur: 8,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 20,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'branded-title-only',
    name: 'Nombre sin fondo',
    description: 'Nombre del himno grande, solo texto con sombra',
    category: 'branded',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#FAFAFA',
      accentColor: '#F59E0B',
    },
    config: {
      fontSize: 50,
      textColor: '#FAFAFA',
      textShadow: true,
      textAlign: 'center',
      showTitle: true,
      titleFontSize: 32,
      titleColor: '#F59E0B',
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'center',
      marginBottom: 50,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
  {
    id: 'branded-left',
    name: 'Alineado Izquierda',
    description: 'Texto e identificación alineados a la izquierda',
    category: 'branded',
    preview: {
      backgroundColor: 'transparent',
      textColor: '#FAFAF9',
      accentColor: '#FB923C',
    },
    config: {
      fontSize: 42,
      textColor: '#FAFAF9',
      textShadow: true,
      textAlign: 'left',
      showTitle: true,
      titleFontSize: 22,
      titleColor: '#FB923C',
      showPanel: false,
      position: 'bottom',
      horizontalAlignment: 'left',
      marginLeft: 60,
      marginBottom: 50,
      pageBackgroundColor: '#000000',
      pageBackgroundOpacity: 0,
      showBackgroundGradient: false,
    },
  },
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: DisplayTemplate['category']): DisplayTemplate[] => {
  return DISPLAY_TEMPLATES.filter(t => t.category === category);
};

/**
 * Get a template by ID
 */
export const getTemplateById = (id: string): DisplayTemplate | undefined => {
  return DISPLAY_TEMPLATES.find(t => t.id === id);
};

/**
 * Apply a template to the current config
 * Merges template config with defaults
 */
export const applyTemplate = (template: DisplayTemplate): DisplayConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...template.config,
  };
};

/**
 * Category display names
 */
export const TEMPLATE_CATEGORIES: Record<DisplayTemplate['category'], string> = {
  minimal: 'Minimalista',
  contrast: 'Alto Contraste',
  elegant: 'Elegante',
  branded: 'Con Marca',
};

// ─────────────────────────────────────────────────────────
// PROJECTION TEMPLATES
// Rules:
// - textAlign is always 'center'
// - showBackground is always true (gradient backgrounds)
// - maxWidth is bounded (700–1100) — not full-width like display
// ─────────────────────────────────────────────────────────

export interface ProjectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'clasico' | 'moderno' | 'espiritual' | 'luminoso';
  preview: {
    gradient: string;
    textColor: string;
    accentColor: string;
  };
  config: Partial<ProjectionConfig>;
}

export const PROJECTION_TEMPLATE_CATEGORIES: Record<ProjectionTemplate['category'], string> = {
  clasico: 'Clásico',
  moderno: 'Moderno',
  espiritual: 'Espiritual',
  luminoso: 'Luminoso',
};

export const PROJECTION_TEMPLATES: ProjectionTemplate[] = [
  // ============ CLÁSICO ============
  {
    id: 'clasico-dorado',
    name: 'Adoración Clásica',
    description: 'Panel oscuro, título dorado, fuente serif',
    category: 'clasico',
    preview: {
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
      textColor: '#FFFFFF',
      accentColor: '#F5C842',
    },
    config: {
      fontSize: 52,
      fontFamily: 'Georgia, serif',
      textColor: '#FFFFFF',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 26,
      titleColor: '#F5C842',
      showPanel: true,
      panelBackground: '#000000',
      panelOpacity: 0.55,
      panelBlur: 20,
      position: 'bottom',
      maxWidth: 900,
      padding: 36,
      marginBottom: 60,
      showBackground: true,
      backgroundCategory: 'spiritual',
      backgroundMode: 'random',
    },
  },
  {
    id: 'clasico-proclamacion',
    name: 'Proclamación',
    description: 'Texto grande, contraste alto, ancho completo',
    category: 'clasico',
    preview: {
      gradient: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)',
      textColor: '#FFFFFF',
      accentColor: '#E5E7EB',
    },
    config: {
      fontSize: 64,
      fontFamily: 'Arial, Helvetica, sans-serif',
      textColor: '#FFFFFF',
      textAlign: 'center',
      textShadow: false,
      showTitle: false,
      showPanel: true,
      panelBackground: '#000000',
      panelOpacity: 0.75,
      panelBlur: 0,
      position: 'bottom',
      maxWidth: 1100,
      padding: 32,
      marginBottom: 40,
      showBackground: true,
      backgroundCategory: 'all',
      backgroundMode: 'random',
    },
  },
  // ============ ESPIRITUAL ============
  {
    id: 'espiritual-celestial',
    name: 'Celestial',
    description: 'Sin panel, texto con sombra, posición central',
    category: 'espiritual',
    preview: {
      gradient: 'linear-gradient(180deg, #0a2a6e 0%, #1a5786 50%, #2d8bba 100%)',
      textColor: '#FFFFFF',
      accentColor: '#BFE0FF',
    },
    config: {
      fontSize: 54,
      fontFamily: 'Georgia, serif',
      textColor: '#FFFFFF',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 24,
      titleColor: '#BFE0FF',
      showPanel: false,
      position: 'middle',
      maxWidth: 800,
      padding: 32,
      marginBottom: 0,
      marginTop: 0,
      showBackground: true,
      backgroundCategory: 'sky',
      backgroundMode: 'random',
    },
  },
  {
    id: 'espiritual-intimo',
    name: 'Momentos Íntimos',
    description: 'Fuente menor, minimalista, espacio contemplativo',
    category: 'espiritual',
    preview: {
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #3d5a6b 60%, #4a7c8f 100%)',
      textColor: '#F0F4F8',
      accentColor: '#8EC5FC',
    },
    config: {
      fontSize: 44,
      fontFamily: 'Georgia, serif',
      textColor: '#F0F4F8',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 20,
      titleColor: '#8EC5FC',
      showPanel: false,
      position: 'bottom',
      maxWidth: 700,
      padding: 28,
      marginBottom: 80,
      showBackground: true,
      backgroundCategory: 'peaceful',
      backgroundMode: 'random',
    },
  },
  {
    id: 'espiritual-noche',
    name: 'Noche de Adoración',
    description: 'Panel translúcido, acento violeta',
    category: 'espiritual',
    preview: {
      gradient: 'linear-gradient(180deg, #0d0221 0%, #1a0a3d 50%, #2d0a6e 100%)',
      textColor: '#EDE9FE',
      accentColor: '#A78BFA',
    },
    config: {
      fontSize: 50,
      fontFamily: 'Georgia, serif',
      textColor: '#EDE9FE',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 24,
      titleColor: '#A78BFA',
      showPanel: true,
      panelBackground: '#1a0a3d',
      panelOpacity: 0.50,
      panelBlur: 16,
      position: 'bottom',
      maxWidth: 850,
      padding: 32,
      marginBottom: 60,
      showBackground: true,
      backgroundCategory: 'spiritual',
      backgroundMode: 'random',
    },
  },
  // ============ LUMINOSO ============
  {
    id: 'luminoso-gloria',
    name: 'Gloria',
    description: 'Texto grande, título ámbar, panel difuminado',
    category: 'luminoso',
    preview: {
      gradient: 'linear-gradient(135deg, #4a1942 0%, #874bae 60%, #c06c84 100%)',
      textColor: '#FFFBEB',
      accentColor: '#FCD34D',
    },
    config: {
      fontSize: 60,
      fontFamily: 'Georgia, serif',
      textColor: '#FFFBEB',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 28,
      titleColor: '#FCD34D',
      showPanel: true,
      panelBackground: '#1a0a2e',
      panelOpacity: 0.45,
      panelBlur: 24,
      position: 'bottom',
      maxWidth: 1000,
      padding: 36,
      marginBottom: 50,
      showBackground: true,
      backgroundCategory: 'spiritual',
      backgroundMode: 'random',
    },
  },
  {
    id: 'luminoso-luz',
    name: 'Luz y Verdad',
    description: 'Tonos cálidos, título prominente, panel blur',
    category: 'luminoso',
    preview: {
      gradient: 'linear-gradient(135deg, #f0a500 0%, #e05c00 60%, #c0360c 100%)',
      textColor: '#FFFFFF',
      accentColor: '#FEF3C7',
    },
    config: {
      fontSize: 52,
      fontFamily: 'Georgia, serif',
      textColor: '#FFFFFF',
      textAlign: 'center',
      textShadow: true,
      showTitle: true,
      titleFontSize: 28,
      titleColor: '#FEF3C7',
      showPanel: true,
      panelBackground: '#7c2d12',
      panelOpacity: 0.55,
      panelBlur: 20,
      position: 'bottom',
      maxWidth: 900,
      padding: 32,
      marginBottom: 60,
      showBackground: true,
      backgroundCategory: 'nature',
      backgroundMode: 'random',
    },
  },
  // ============ MODERNO ============
  {
    id: 'moderno-limpio',
    name: 'Moderno Limpio',
    description: 'Sans-serif, sin sombras, sutil y legible',
    category: 'moderno',
    preview: {
      gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 60%, #1f2937 100%)',
      textColor: '#F9FAFB',
      accentColor: '#6EE7B7',
    },
    config: {
      fontSize: 48,
      fontFamily: 'Inter, Arial, sans-serif',
      textColor: '#F9FAFB',
      textAlign: 'center',
      textShadow: false,
      showTitle: true,
      titleFontSize: 22,
      titleColor: '#6EE7B7',
      showPanel: true,
      panelBackground: '#111827',
      panelOpacity: 0.65,
      panelBlur: 12,
      position: 'bottom',
      maxWidth: 1000,
      padding: 32,
      marginBottom: 50,
      showBackground: true,
      backgroundCategory: 'light',
      backgroundMode: 'random',
    },
  },
];

export const applyProjectionTemplate = (template: ProjectionTemplate): ProjectionConfig => {
  return {
    ...DEFAULT_PROJECTION_CONFIG,
    ...template.config,
  };
};
