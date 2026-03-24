/**
 * Hymn Service
 * ============
 * Service for loading and searching hymns.
 */

import { parse as parseYaml } from 'yaml';
import hymnbooksYaml from '../app/data/hymns.yaml?raw';
import type { Hymn, Hymnbook } from '../shared/types';

/**
 * Process verses and detect CORO (chorus) sections.
 */
function processVerses(verses: unknown[]): string[] {
  if (!Array.isArray(verses)) return [];

  return verses.map((v) => {
    const text = String(v).trim();
    
    // If it starts with "CORO" or "ULTIMO CORO" (and variants), mark it with special anchor
    if (/^[\d.\s(*]*(?:[ÚU]LTIMO\s+)?CORO/i.test(text)) {
      const lines = text.split('\n');
      const header = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();
      return `@CORO@${header}\n${body}`;
    }
    
    return text;
  });
}

/**
 * Parse hymnbooks from YAML text.
 */
function parseHymnbooksFromYaml(yamlText: string): Record<string, Hymnbook> {
  console.log('[HymnService] Loading YAML, length:', yamlText?.length);

  if (!yamlText || yamlText.trim() === '') {
    console.error('[HymnService] YAML file is empty');
    return {};
  }

  try {
    const parsed = parseYaml(yamlText) as unknown;

    // Case 1: Direct array
    if (Array.isArray(parsed)) {
      return {
        default: {
          name: 'Himnario',
          hymns: parsed.map((h: Record<string, unknown>, index: number) => ({
            number: typeof h.number === 'number' ? h.number : index + 1,
            title: typeof h.title === 'string' ? h.title : 'Sin título',
            verses: processVerses(Array.isArray(h.verses) ? h.verses : []),
          })),
        },
      };
    }

    // Case 2: Multiple hymnbooks
    if (parsed && typeof parsed === 'object') {
      const hymnbooksFromYaml: Record<string, Hymnbook> = {};

      for (const [id, hymnbook] of Object.entries(parsed as Record<string, unknown>)) {
        if (!hymnbook || typeof hymnbook !== 'object') continue;

        const bookData = hymnbook as Record<string, unknown>;
        hymnbooksFromYaml[id] = {
          name: typeof bookData.name === 'string' ? bookData.name : id,
          hymns: Array.isArray(bookData.hymns)
            ? bookData.hymns.map((h: Record<string, unknown>, index: number) => ({
                number: typeof h.number === 'number' ? h.number : index + 1,
                title: typeof h.title === 'string' ? h.title : 'Sin título',
                verses: processVerses(Array.isArray(h.verses) ? h.verses : []),
              }))
            : [],
        };
      }

      return hymnbooksFromYaml;
    }

    return {};
  } catch (err) {
    console.error('[HymnService] Error parsing YAML:', err);
    return {};
  }
}

/**
 * Loaded hymnbooks.
 */
export const hymnbooks: Record<string, Hymnbook> = (() => {
  try {
    return parseHymnbooksFromYaml(hymnbooksYaml);
  } catch (err) {
    console.error('[HymnService] Fatal error loading hymns.yaml:', err);
    return {};
  }
})();

/**
 * Search hymns in a hymnbook by number or title.
 */
export function searchHymns(hymnbookId: string, query: string): Hymn[] {
  const hymnbook = hymnbooks[hymnbookId];
  if (!hymnbook) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return hymnbook.hymns;

  return hymnbook.hymns.filter(
    (hymn) =>
      hymn.number.toString().includes(normalizedQuery) ||
      hymn.title.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get a specific hymn by number.
 */
export function getHymnByNumber(hymnbookId: string, number: number): Hymn | undefined {
  const hymnbook = hymnbooks[hymnbookId];
  return hymnbook?.hymns.find((h) => h.number === number);
}

/**
 * Get all available hymnbook IDs.
 */
export function getHymnbookIds(): string[] {
  return Object.keys(hymnbooks);
}

/**
 * Get hymnbook metadata (without all hymns).
 */
export function getHymnbookMeta(hymnbookId: string): { name: string; count: number } | null {
  const hymnbook = hymnbooks[hymnbookId];
  if (!hymnbook) return null;
  return { name: hymnbook.name, count: hymnbook.hymns.length };
}
