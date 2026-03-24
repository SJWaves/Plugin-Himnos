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
  console.log('YAML cargado, longitud:', yamlText?.length);
  
  if (!yamlText || yamlText.trim() === '') {
    console.error('El archivo YAML está vacío');
    return {};
  }

  try {
    const parsed = parseYaml(yamlText) as unknown;
    
    // Función interna para procesar los versos y detectar el CORO
    const processVerses = (verses: any[]): string[] => {
      if (!Array.isArray(verses)) return [];
      
      return verses.map((v: any) => {
        const text = String(v).trim();
        // Si detecta "CORO" o "ULTIMO CORO" (y variantes) al inicio, le ponemos la marca especial @
        if (/^[\d.\s(*]*(?:[ÚU]LTIMO\s+)?CORO/i.test(text)) {
          const lines = text.split('\n');
          const header = lines[0].trim(); // "CORO"
          const body = lines.slice(1).join('\n').trim(); // El resto del texto
          // Usamos @CORO@ como un "ancla" que tu componente React usará para separar
          return `@CORO@${header}\n${body}`;
        }
        return text;
      });
    };

    // Caso 1: Array directo
    if (Array.isArray(parsed)) {
      return {
        'default': {
          name: 'Himnario',
          hymns: parsed.map((h: any, index: number) => ({
            number: typeof h.number === 'number' ? h.number : index + 1,
            title: h.title || 'Sin título',
            verses: processVerses(h.verses)
          }))
        }
      };
    }
    
    // Caso 2: Múltiples himnarios
    if (parsed && typeof parsed === 'object') {
      const hymnbooksFromYaml: Record<string, Hymnbook> = {};
      
      for (const [id, hymnbook] of Object.entries(parsed as Record<string, any>)) {
        if (!hymnbook || typeof hymnbook !== 'object') continue;
        
        hymnbooksFromYaml[id] = {
          name: hymnbook.name || id,
          hymns: Array.isArray(hymnbook.hymns) 
            ? hymnbook.hymns.map((h: any, index: number) => ({
                number: typeof h.number === 'number' ? h.number : index + 1,
                title: h.title || 'Sin título',
                verses: processVerses(h.verses)
              }))
            : []
        };
      }
      return hymnbooksFromYaml;
    }
    
    return {};
  } catch (err) {
    console.error('Error parseando YAML:', err);
    return {};
  }
}

export const hymnbooks: Record<string, Hymnbook> = (() => {
  try {
    return parseHymnbooksFromYaml(hymnbooksYaml);
  } catch (err) {
    console.error('[hymns] Error fatal cargando hymns.yaml:', err);
    return {};
  }
})();

// --- Funciones de búsqueda (sin cambios) ---

export function searchHymns(hymnbookId: string, query: string): Hymn[] {
  const hymnbook = hymnbooks[hymnbookId];
  if (!hymnbook) return [];
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return hymnbook.hymns;
  return hymnbook.hymns.filter((hymn) => 
    hymn.number.toString().includes(normalizedQuery) || 
    hymn.title.toLowerCase().includes(normalizedQuery)
  );
}

export function getHymnByNumber(hymnbookId: string, number: number): Hymn | undefined {
  const hymnbook = hymnbooks[hymnbookId];
  return hymnbook?.hymns.find(h => h.number === number);
}