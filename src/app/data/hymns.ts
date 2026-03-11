import { parse as parseYaml } from 'yaml';
import hymnbooksYaml from './hymns.yaml?raw';

export interface Hymn {
  number: number;
  title: string;
  verses: string[];
}

export interface Hymnbook {
  name: string;
  hymns: Hymn[];
}

function parseHymnbooksFromYaml(yamlText: string): Record<string, Hymnbook> {
  const parsed = parseYaml(yamlText) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El YAML no contiene un objeto raíz válido.');
  }

  const hymnbooksFromYaml: Record<string, Hymnbook> = {};
  for (const [id, hymnbook] of Object.entries(parsed as Record<string, any>)) {
    if (!hymnbook || typeof hymnbook !== 'object' || Array.isArray(hymnbook)) {
      throw new Error(`Himnario inválido: ${id}`);
    }
    if (typeof hymnbook.name !== 'string' || !Array.isArray(hymnbook.hymns)) {
      throw new Error(`Estructura inválida en himnario: ${id}`);
    }

    hymnbooksFromYaml[id] = {
      name: hymnbook.name,
      hymns: hymnbook.hymns.map((h: any) => {
        if (
          !h ||
          typeof h !== 'object' ||
          typeof h.number !== 'number' ||
          typeof h.title !== 'string' ||
          !Array.isArray(h.verses) ||
          !h.verses.every((v: any) => typeof v === 'string')
        ) {
          throw new Error(`Himno inválido en himnario: ${id}`);
        }
        return { number: h.number, title: h.title, verses: h.verses };
      }),
    };
  }

  return hymnbooksFromYaml;
}

export const hymnbooks: Record<string, Hymnbook> = (() => {
  try {
    return parseHymnbooksFromYaml(hymnbooksYaml);
  } catch (err) {
    console.error('[hymns] Error cargando hymns.yaml:', err);
    return {};
  }
})();

export function searchHymns(hymnbookId: string, query: string): Hymn[] {
  const hymnbook = hymnbooks[hymnbookId];
  if (!hymnbook) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return hymnbook.hymns;

  return hymnbook.hymns.filter((hymn) => {
    const matchesNumber = hymn.number.toString().includes(normalizedQuery);
    const matchesTitle = hymn.title.toLowerCase().includes(normalizedQuery);
    return matchesNumber || matchesTitle;
  });
}
