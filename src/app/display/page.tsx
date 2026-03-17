import { useEffect, useState } from 'react';
import {
  HymnDisplay,
  DisplayConfig,
  HymnBroadcaster,
  getCurrentDisplay,
  getStoredConfig,
} from '../utils/broadcast';

export default function DisplayPage() {
  const [display, setDisplay] = useState<HymnDisplay | null>(null);
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig());
  const [broadcaster] = useState(() => new HymnBroadcaster());

  const normalizeText = (text: string) => {
    // Si es un coro marcado, normalizamos solo el cuerpo del texto tras la marca
    if (text.includes('@CORO@')) {
      const parts = text.split('\n');
      const header = parts[0];
      const body = parts.slice(1).join('\n');
      
      const normalizedBody = body.replace(/\r\n/g, '\n').split(/\n{2,}/g)
        .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n\n');
        
      return `${header}\n${normalizedBody}`;
    }

    const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/g);
    return blocks
      .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n');
  };

  useEffect(() => {
    const initialDisplay = getCurrentDisplay();
    if (initialDisplay) {
      setDisplay(initialDisplay);
      if (initialDisplay.config) setConfig(initialDisplay.config);
    }

    const broadcaster = new HymnBroadcaster();
    broadcaster.onMessage((message) => {
      if (message.type === 'display') {
        const next = message.data as HymnDisplay | null;
        setDisplay(next);
        if (next?.config) setConfig(next.config);
      } else if (message.type === 'config') {
        setConfig(message.data);
      }
    });

    return () => broadcaster.close();
  }, []);

  if (!display) return <div className="w-full h-screen" style={{ backgroundColor: 'transparent' }} />;

  const verticalPositionStyle =
    config.position === 'top'
      ? { top: `${config.marginTop + config.verticalOffset}px` }
      : config.position === 'middle'
        ? { top: '50%', transform: 'translateY(-50%)' }
        : { bottom: `${config.marginBottom + config.verticalOffset}px` };

  const horizontalAlignmentStyle =
    config.horizontalAlignment === 'left'
      ? { left: `${config.marginLeft + config.horizontalOffset}px` }
      : config.horizontalAlignment === 'right'
        ? { right: `${config.marginRight + config.horizontalOffset}px` }
        : { left: '50%', transform: config.position === 'middle' ? 'translate(-50%, -50%)' : 'translateX(-50%)' };

  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[config.textAlign];

  const rawText = config.normalizeLineBreaks ? normalizeText(display.verseText) : display.verseText;

  // Lógica de separación de CORO
  const isCoro = rawText.includes('@CORO@');
  const displayTitle = isCoro ? "Coro" : null;
  const cleanVerseText = isCoro ? rawText.replace(/@CORO@CORO|@CORO@/g, '').trim() : rawText;

  return (
    <div
      className="w-full h-screen pointer-events-none"
      style={{ backgroundColor: 'transparent', fontFamily: config.fontFamily }}
    >
      {config.showBackgroundGradient && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(197, 160, 33, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        className="absolute transition-all duration-300"
        style={{
          ...verticalPositionStyle,
          ...horizontalAlignmentStyle,
          maxWidth: `${config.maxWidth}px`,
          padding: `${config.padding}px`,
          width: 'fit-content',
        }}
      >
        <div
          style={{
            background: config.showPanel
              ? `rgba(${parseInt(config.panelBackground.slice(1, 3), 16)}, ${parseInt(config.panelBackground.slice(3, 5), 16)}, ${parseInt(config.panelBackground.slice(5, 7), 16)}, ${config.panelOpacity})`
              : 'transparent',
            backdropFilter: config.showPanel ? `blur(${config.panelBlur}px)` : 'none',
            WebkitBackdropFilter: config.showPanel ? `blur(${config.panelBlur}px)` : 'none',
            border: config.showPanel ? `1px solid ${config.panelBorderColor}40` : 'none',
            borderRadius: config.showPanel ? '12px' : '0px',
            padding: config.showPanel ? `${config.padding}px` : '0px',
            boxShadow: config.showPanel ? `0 8px 32px 0 rgba(0, 0, 0, 0.4)` : 'none',
          }}
        >
          {/* Título del himno (Opcional en config) */}
          {config.showTitle && (
            <div className={`mb-4 ${textAlignClass}`}>
              <h2
                style={{
                  fontSize: `${config.titleFontSize}px`,
                  color: config.titleColor,
                  fontWeight: '700',
                  textShadow: config.textShadow ? '2px 2px 4px rgba(0, 0, 0, 0.8)' : 'none',
                  margin: 0,
                }}
              >
                Himno {display.hymnNumber} – {display.hymnTitle}
              </h2>
            </div>
          )}

          {/* AJUSTE: Si es Coro, mostramos el indicador arriba */}
          {isCoro && (
            <div className={`${textAlignClass} mb-2`}>
              <span
                style={{
                  fontSize: `${Math.max(config.fontSize * 0.5, 16)}px`,
                  color: config.titleColor, // Usamos el color de título para el Coro
                  fontStyle: 'italic',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                — {displayTitle} —
              </span>
            </div>
          )}

          {/* Texto del verso / cuerpo del coro */}
          <div className={textAlignClass}>
            <p
              style={{
                fontSize: `${config.fontSize}px`,
                color: config.textColor,
                textShadow: config.textShadow
                  ? '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.6)'
                  : 'none',
                margin: 0,
                lineHeight: '1.6',
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
  );
}