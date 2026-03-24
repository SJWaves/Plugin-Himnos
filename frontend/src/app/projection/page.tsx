import { useEffect, useState, useRef, useCallback } from 'react';
import {
  HymnDisplay,
  HymnBroadcaster,
  ProjectionConfig,
  getCurrentDisplay,
  getStoredProjectionConfig,
} from '../utils/broadcast';
import {
  PROJECTION_BACKGROUNDS,
  getBackgroundsByCategory,
  getRandomBackground,
} from '../../shared/constants/projection-backgrounds';

// ── helpers ─────────────────────────────────────────────────────────────────

const normalizeText = (text: string): string => {
  if (text.includes('@CORO@')) {
    const parts = text.split('\n');
    const header = parts[0];
    const body = parts.slice(1).join('\n');
    const normalizedBody = body
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/g)
      .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n');
    return `${header}\n${normalizedBody}`;
  }
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/g)
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
};

const hexToRgb = (hex: string) => {
  const h = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

const toRgba = (hex: string, alpha: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
};

// ── component ────────────────────────────────────────────────────────────────

export default function ProjectionPage() {
  const [display, setDisplay] = useState<HymnDisplay | null>(null);
  const [config, setConfig] = useState<ProjectionConfig>(getStoredProjectionConfig());
  const [animationKey, setAnimationKey] = useState(0);
  const [bgId, setBgId] = useState<string>(() => {
    const initial = getStoredProjectionConfig();
    if (!initial.showBackground) return PROJECTION_BACKGROUNDS[0].id;
    if (initial.backgroundMode === 'fixed') {
      const pool = getBackgroundsByCategory(initial.backgroundCategory);
      return (pool[initial.backgroundIndex] ?? pool[0] ?? PROJECTION_BACKGROUNDS[0]).id;
    }
    return getRandomBackground(initial.backgroundCategory).id;
  });

  const lastHymnRef = useRef<number | null>(null);
  const cycleIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Resolve the current background object
  const currentBg =
    PROJECTION_BACKGROUNDS.find((b) => b.id === bgId) ?? PROJECTION_BACKGROUNDS[0];

  const advanceBackground = useCallback(
    (cfg: ProjectionConfig, currentId: string) => {
      if (!cfg.showBackground) return;
      if (cfg.backgroundMode === 'fixed') {
        const pool = getBackgroundsByCategory(cfg.backgroundCategory);
        const idx = Math.min(cfg.backgroundIndex, pool.length - 1);
        setBgId((pool[idx] ?? pool[0]).id);
        return;
      }
      if (cfg.backgroundMode === 'random') {
        setBgId(getRandomBackground(cfg.backgroundCategory, currentId).id);
        return;
      }
      // cycle
      const pool = getBackgroundsByCategory(cfg.backgroundCategory);
      cycleIndexRef.current = (cycleIndexRef.current + 1) % pool.length;
      setBgId(pool[cycleIndexRef.current].id);
    },
    [],
  );

  // Subscribe to BroadcastChannel
  useEffect(() => {
    const initialDisplay = getCurrentDisplay();
    if (initialDisplay) {
      setDisplay(initialDisplay);
      if (initialDisplay.config) {/* display page config — ignored here */}
    }

    const broadcaster = new HymnBroadcaster();
    broadcaster.onMessage((message) => {
      if (message.type === 'display') {
        const next = message.data as HymnDisplay | null;
        setDisplay(next);
        setAnimationKey((k) => k + 1);

        // Change background on new hymn (only if backgroundChangeOnHymn)
        setConfig((cfg) => {
          if (cfg.backgroundChangeOnHymn && next && next.hymnNumber !== lastHymnRef.current) {
            lastHymnRef.current = next.hymnNumber;
            advanceBackground(cfg, bgId);
          } else if (next) {
            lastHymnRef.current = next.hymnNumber;
          }
          return cfg;
        });
      } else if (message.type === 'projection-config') {
        const next = message.data as ProjectionConfig;
        setConfig(next);
        // Re-apply background with new config
        advanceBackground(next, bgId);
      }
    });

    return () => broadcaster.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => setAnimationKey((k) => k + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Content parsing ──────────────────────────────────────────────
  const rawText = display ? normalizeText(display.verseText) : '';
  const isCoro = rawText.includes('@CORO@');
  const coroHeader = isCoro ? (rawText.match(/@CORO@([^\n]*)/) ?? [])[1]?.trim() ?? '' : '';
  const displayTitle = isCoro ? (/ULTIMO/i.test(coroHeader) ? 'Último Coro' : 'Coro') : null;
  const cleanVerseText = isCoro ? rawText.replace(/@CORO@[^\n]*\n?/, '').trim() : rawText;
  const textAlignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[config.textAlign];

  // ── Vertical position ────────────────────────────────────────────
  const verticalPositionStyle =
    config.position === 'top'
      ? { top: `${config.marginTop}px` }
      : config.position === 'middle'
        ? { top: '50%', transform: 'translateY(-50%)' }
        : { bottom: `${config.marginBottom}px` };

  // ── If projection disabled, render nothing ───────────────────────
  if (!config.enabled) {
    return <div className="fixed inset-0 bg-black" />;
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ fontFamily: config.fontFamily }}
    >
      {/* Background gradient */}
      {config.showBackground && (
        <div
          key={`bg-${bgId}`}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ background: currentBg.gradient }}
        />
      )}

      {/* Dark overlay to improve text readability */}
      {config.showBackground && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${config.backgroundOverlayOpacity})` }}
        />
      )}

      {/* No-background fallback: solid dark */}
      {!config.showBackground && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes projFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .proj-animate { animation: projFadeIn 0.6s ease-out forwards; }
      `}</style>

      {/* Content overlay — only shown when there is active display data */}
      {display && (
        <div
          ref={containerRef}
          className="absolute w-full flex justify-center pointer-events-none"
          style={verticalPositionStyle}
        >
          <div
            style={{
              width: '100%',
              maxWidth: `${config.maxWidth}px`,
              padding: `0 ${config.padding}px`,
            }}
          >
            <div
              key={animationKey}
              className="proj-animate"
              style={{
                background: config.showPanel
                  ? toRgba(config.panelBackground, config.panelOpacity)
                  : 'transparent',
                backdropFilter: config.showPanel ? `blur(${config.panelBlur}px)` : 'none',
                WebkitBackdropFilter: config.showPanel ? `blur(${config.panelBlur}px)` : 'none',
                border: config.showPanel
                  ? `1px solid ${toRgba(config.titleColor, 0.3)}`
                  : 'none',
                borderRadius: config.showPanel ? '16px' : '0',
                padding: config.showPanel ? `${config.padding}px` : '0',
                boxShadow: config.showPanel
                  ? '0 8px 40px 0 rgba(0,0,0,0.5)'
                  : 'none',
              }}
            >
              {/* Hymn title */}
              {config.showTitle && (
                <div className={`mb-4 ${textAlignClass}`}>
                  <h2
                    style={{
                      fontSize: `${config.titleFontSize}px`,
                      color: config.titleColor,
                      fontWeight: '700',
                      margin: 0,
                      textShadow: config.textShadow
                        ? '2px 2px 6px rgba(0,0,0,0.9)'
                        : 'none',
                    }}
                  >
                    Himno {display.hymnNumber} – {display.hymnTitle}
                  </h2>
                </div>
              )}

              {/* Coro label */}
              {isCoro && (
                <div className={`${textAlignClass} mb-2`}>
                  <span
                    style={{
                      fontSize: `${Math.max(config.fontSize * 0.5, 16)}px`,
                      color: config.titleColor,
                      fontStyle: 'italic',
                      fontWeight: '600',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.1em',
                      textShadow: config.textShadow ? '1px 1px 4px rgba(0,0,0,0.9)' : 'none',
                    }}
                  >
                    — {displayTitle} —
                  </span>
                </div>
              )}

              {/* Verse text */}
              <div ref={textRef} className={textAlignClass}>
                <p
                  style={{
                    fontSize: `${config.fontSize}px`,
                    color: config.textColor,
                    textShadow: config.textShadow
                      ? '2px 2px 8px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.7)'
                      : 'none',
                    margin: 0,
                    lineHeight: '1.65',
                    whiteSpace: 'pre-line',
                    wordWrap: 'break-word',
                  }}
                >
                  {cleanVerseText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle state — show when no verse is active */}
      {!display && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center opacity-30">
            <p
              style={{
                fontSize: '28px',
                color: '#FFFFFF',
                fontFamily: config.fontFamily,
                textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                letterSpacing: '0.05em',
              }}
            >
              ♪ Proyección de Himnos ♪
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
