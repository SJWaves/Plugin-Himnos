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

  useEffect(() => {
    const initialDisplay = getCurrentDisplay();
    if (initialDisplay) setDisplay(initialDisplay);

    const broadcaster = new HymnBroadcaster();
    broadcaster.onMessage((message) => {
      if (message.type === 'display') {
        setDisplay(message.data);
      } else if (message.type === 'config') {
        setConfig(message.data);
      }
    });

    return () => broadcaster.close();
  }, []);

  if (!display) return <div className="w-full h-screen" style={{ backgroundColor: 'transparent' }} />;

  // Posición vertical
  const verticalPositionStyle =
    config.position === 'top'
      ? { top: `${config.marginTop + config.verticalOffset}px` }
      : config.position === 'middle'
        ? { top: '50%', transform: 'translateY(-50%)' }
        : { bottom: `${config.marginBottom + config.verticalOffset}px` };

  // Alineación horizontal
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

  return (
    <div
      className="w-full h-screen pointer-events-none"
      style={{ backgroundColor: 'transparent', fontFamily: config.fontFamily }}
    >
      {/* Efecto de gradiente sutil en el fondo (solo visual) */}
      {config.showBackgroundGradient && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(197, 160, 33, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Contenedor de texto posicionado */}
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
        {/* Panel opcional con efecto glass */}
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
            boxShadow: config.showPanel
              ? `0 8px 32px 0 rgba(0, 0, 0, 0.4)`
              : 'none',
          }}
        >
          {/* Título del himno - opcional */}
          {config.showTitle && (
            <div className={`mb-4 ${textAlignClass}`}>
              <h2
                style={{
                  fontSize: `${config.titleFontSize}px`,
                  color: config.titleColor,
                  fontWeight: '700',
                  textShadow: config.textShadow
                    ? '2px 2px 4px rgba(0, 0, 0, 0.8)'
                    : 'none',
                  margin: 0,
                }}
              >
                Himno {display.hymnNumber} – {display.hymnTitle}
              </h2>
            </div>
          )}

          {/* Texto del verso */}
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
              {display.verseText}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de debug - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute bottom-2 right-2 text-white/30 text-xs font-mono bg-black/30 px-2 py-1 rounded pointer-events-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          {display.verseIndex + 1} / {config.fontSize}px
        </div>
      )}
    </div>
  );
}