/**
 * Background gradients for the Projection view.
 * Designed for church / worship context: nature, skies, light, peaceful landscapes, spiritual.
 * All are CSS gradient strings — zero external dependencies, work fully offline.
 */

export type BackgroundCategory = 'nature' | 'sky' | 'light' | 'peaceful' | 'spiritual';

export interface ProjectionBackground {
  id: string;
  category: BackgroundCategory;
  name: string;
  gradient: string;
}

export const BACKGROUND_CATEGORIES: Record<BackgroundCategory, string> = {
  nature: 'Naturaleza',
  sky: 'Cielos',
  light: 'Luz',
  peaceful: 'Paisaje',
  spiritual: 'Espiritual',
};

export const PROJECTION_BACKGROUNDS: ProjectionBackground[] = [
  // ── NATURALEZA ──────────────────────────────────────────────────
  {
    id: 'nature-forest',
    category: 'nature',
    name: 'Bosque Profundo',
    gradient: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  {
    id: 'nature-meadow',
    category: 'nature',
    name: 'Pradera',
    gradient: 'linear-gradient(160deg, #134e5e 0%, #3a7d44 50%, #71b280 100%)',
  },
  {
    id: 'nature-earth',
    category: 'nature',
    name: 'Tierra Cálida',
    gradient: 'linear-gradient(160deg, #3e1c00 0%, #7a4100 50%, #5a3800 100%)',
  },
  {
    id: 'nature-aurora',
    category: 'nature',
    name: 'Aurora Verde',
    gradient: 'linear-gradient(160deg, #000428 0%, #004e2c 55%, #006400 100%)',
  },

  // ── CIELOS ──────────────────────────────────────────────────────
  {
    id: 'sky-dawn',
    category: 'sky',
    name: 'Amanecer',
    gradient: 'linear-gradient(180deg, #0c0c1d 0%, #1a1a4e 25%, #6b3e7d 55%, #c0392b 78%, #e67e22 100%)',
  },
  {
    id: 'sky-dusk',
    category: 'sky',
    name: 'Atardecer',
    gradient: 'linear-gradient(180deg, #0d0d2b 0%, #3b1f6e 40%, #c0392b 72%, #f39c12 100%)',
  },
  {
    id: 'sky-night',
    category: 'sky',
    name: 'Noche Estrellada',
    gradient: 'linear-gradient(180deg, #000000 0%, #0a0020 50%, #050c2c 100%)',
  },
  {
    id: 'sky-blue',
    category: 'sky',
    name: 'Cielo Azul',
    gradient: 'linear-gradient(180deg, #0a174e 0%, #1565c0 50%, #42a5f5 100%)',
  },

  // ── LUZ ─────────────────────────────────────────────────────────
  {
    id: 'light-gold-ray',
    category: 'light',
    name: 'Rayo Dorado',
    gradient: 'radial-gradient(ellipse at 50% 0%, #c8a035 0%, #5b3a00 50%, #1a0f00 100%)',
  },
  {
    id: 'light-warm',
    category: 'light',
    name: 'Luz Cálida',
    gradient: 'radial-gradient(ellipse at 50% 30%, #fff4cc 0%, #c8860a 45%, #3b2000 100%)',
  },
  {
    id: 'light-divine',
    category: 'light',
    name: 'Luz Divina',
    gradient: 'radial-gradient(ellipse at 50% 20%, #fffde0 0%, #ffd700 20%, #c8860a 45%, #2a1500 100%)',
  },

  // ── PAISAJE TRANQUILO ────────────────────────────────────────────
  {
    id: 'peaceful-water',
    category: 'peaceful',
    name: 'Aguas Tranquilas',
    gradient: 'linear-gradient(180deg, #0a1a3b 0%, #1565c0 40%, #29b6f6 75%, #80deea 100%)',
  },
  {
    id: 'peaceful-mountains',
    category: 'peaceful',
    name: 'Montañas',
    gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 35%, #0f3460 65%, #415a77 85%, #778da9 100%)',
  },
  {
    id: 'peaceful-olive',
    category: 'peaceful',
    name: 'Olivos',
    gradient: 'linear-gradient(160deg, #1a2c0a 0%, #2e4a10 40%, #6b7c2d 80%, #8b9a45 100%)',
  },
  {
    id: 'peaceful-sand',
    category: 'peaceful',
    name: 'Arena y Silencio',
    gradient: 'linear-gradient(160deg, #2c1a0e 0%, #7a5230 40%, #c8a06a 80%, #e8c99a 100%)',
  },

  // ── ESPIRITUAL ───────────────────────────────────────────────────
  {
    id: 'spiritual-deep',
    category: 'spiritual',
    name: 'Profundidad',
    gradient: 'linear-gradient(135deg, #03001c 0%, #301467 40%, #5c0099 70%, #170d33 100%)',
  },
  {
    id: 'spiritual-holy',
    category: 'spiritual',
    name: 'Santo',
    gradient: 'radial-gradient(ellipse at 50% 20%, #fdfbd4 0%, #c5a021 25%, #5b3a00 60%, #0a0808 100%)',
  },
  {
    id: 'spiritual-glory',
    category: 'spiritual',
    name: 'Gloria',
    gradient: 'radial-gradient(ellipse at 50% -10%, #ffd700 0%, #c5a021 15%, #8b5a00 35%, #3b1f00 60%, #0a0505 100%)',
  },
  {
    id: 'spiritual-purple',
    category: 'spiritual',
    name: 'Purpúreo',
    gradient: 'linear-gradient(135deg, #0d0221 0%, #3b0764 40%, #5c0099 70%, #800080 100%)',
  },
];

export function getBackgroundsByCategory(
  category: BackgroundCategory | 'all',
): ProjectionBackground[] {
  if (category === 'all') return PROJECTION_BACKGROUNDS;
  return PROJECTION_BACKGROUNDS.filter((b) => b.category === category);
}

export function getRandomBackground(
  category: BackgroundCategory | 'all',
  excludeId?: string,
): ProjectionBackground {
  const pool = getBackgroundsByCategory(category);
  const candidates = pool.length > 1 ? pool.filter((b) => b.id !== excludeId) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
