/**
 * Color utility functions.
 */

/**
 * Convert hex color to RGB object.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert hex color to rgba string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${clamp(alpha, 0, 1)})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
}

/**
 * Validate hex color format.
 */
export function isValidHexColor(hex: string): boolean {
  const normalized = hex.trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(normalized);
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
