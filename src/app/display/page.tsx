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

  if (!display) return <div className="w-full h-screen bg-black" />;

  const positionClasses = {
    top: 'items-start pt-8 sm:pt-16 md:pt-24',
    middle: 'items-center',
    bottom: 'items-end pb-8 sm:pb-16 md:pb-24',
  };

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        fontFamily: config.fontFamily,
        backgroundColor: config.screenBackgroundColor,
      }}
    >
      {/* Fondo con gradiente sutil - solo si showGlassPanel */}
      {config.showGlassPanel && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, rgba(197, 160, 33, 0.1) 0%, transparent 70%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Texto del verso con efecto liquid glass */}
      <div
        className={`w-full h-screen flex flex-col ${positionClasses[config.position]} justify-center px-4 sm:px-6 md:px-8 transition-opacity duration-300`}
      >
        <div
          className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${textAlignClasses[config.textAlign]} mx-auto`}
        >
          <div
            className={`${config.showGlassPanel ? 'glass-golden rounded-2xl sm:rounded-3xl border' : ''} relative overflow-hidden`}
            style={{
              padding: `${config.padding}px`,
              maxWidth: '900px',
              margin: '0 auto',
              background: config.showGlassPanel
                ? `linear-gradient(
                    135deg,
                    rgba(197, 160, 33, 0.08) 0%,
                    rgba(0, 0, 0, 0.5) 50%,
                    rgba(197, 160, 33, 0.05) 100%
                  )`
                : 'transparent',
              backdropFilter: config.showGlassPanel ? 'blur(16px)' : 'none',
              WebkitBackdropFilter: config.showGlassPanel ? 'blur(16px)' : 'none',
              border: config.showGlassPanel ? '1px solid rgba(197, 160, 33, 0.4)' : 'none',
              boxShadow: config.showGlassPanel
                ? `
                    0 12px 40px 0 rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(197, 160, 33, 0.15) inset,
                    0 4px 12px 0 rgba(197, 160, 33, 0.25) inset,
                    0 0 60px rgba(197, 160, 33, 0.15)
                  `
                : 'none',
            }}
          >
            {/* Brillo superior integrado - solo si showGlassPanel */}
            {config.showGlassPanel && (
              <div
                className="absolute top-0 left-0 right-0 h-1/4 rounded-t-2xl sm:rounded-t-3xl opacity-40"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Título del himno - siempre visible */}
            <div className="relative text-center mb-6 sm:mb-8">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-glow"
                style={{
                  textShadow: '0 2px 8px rgba(197, 160, 33, 0.5), 0 0 20px rgba(197, 160, 33, 0.3)',
                }}
              >
                Himno {display.hymnNumber} – {display.hymnTitle}
              </h1>
            </div>

            {/* Texto del verso */}
            <div className="relative">
                <p
                  className="whitespace-pre-line leading-relaxed text-white"
                  style={{
                    fontSize: `clamp(1rem, ${config.fontSize / 30}vw, ${config.fontSize}px)`,
                    color: config.textColor,
                    textShadow: config.textShadow
                      ? '3px 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.5)'
                      : 'none',
                    fontWeight: config.textColor === '#FFFFFF' ? '400' : '500',
                    lineHeight: '1.4',
                  }}
                >
                  {display.verseText}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de página y estado */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-5 md:right-8 text-white/30 text-xs sm:text-sm flex flex-col items-end gap-2">
        <span className="font-mono">
          {display.verseIndex + 1} / {config.fontSize}
        </span>

      </div>
    </div>
  );
}