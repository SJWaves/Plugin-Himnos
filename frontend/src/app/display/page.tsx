import { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  const [animationKey, setAnimationKey] = useState(0);
  const [scaledFontSize, setScaledFontSize] = useState(config.fontSize);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
        setAnimationKey(prev => prev + 1); // Trigger animation on content change
        if (next?.config) setConfig(next.config);
      } else if (message.type === 'config') {
        setConfig(message.data);
      }
    });

    return () => broadcaster.close();
  }, []);

  // Dynamic font scaling based on container height
  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current || !display) {
      setScaledFontSize(config.fontSize);
      return;
    }

    const calculateOptimalFontSize = () => {
      const container = containerRef.current;
      const textEl = textRef.current;
      if (!container || !textEl) return config.fontSize;

      // Get available height (viewport minus margins and padding)
      const availableHeight = window.innerHeight - config.marginTop - config.marginBottom - (config.padding * 2) - 40;
      
      // Start with configured font size and scale down if needed
      let testSize = config.fontSize;
      const minSize = Math.max(config.fontSize * 0.4, 16); // Minimum 40% of original or 16px
      
      // Temporarily set the font size to measure
      const originalSize = textEl.style.fontSize;
      
      while (testSize > minSize) {
        textEl.style.fontSize = `${testSize}px`;
        const contentHeight = textEl.scrollHeight;
        
        if (contentHeight <= availableHeight) {
          break;
        }
        testSize -= 2; // Reduce by 2px increments
      }
      
      textEl.style.fontSize = originalSize;
      return testSize;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const optimalSize = calculateOptimalFontSize();
      setScaledFontSize(optimalSize);
    }, 50);

    return () => clearTimeout(timer);
  }, [display, config.fontSize, config.marginTop, config.marginBottom, config.padding]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      setAnimationKey(prev => prev + 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular el color de fondo de la página (también para estado vacío)
  const pageBackground = config.pageBackgroundOpacity > 0
    ? `rgba(${parseInt(config.pageBackgroundColor.slice(1, 3), 16)}, ${parseInt(config.pageBackgroundColor.slice(3, 5), 16)}, ${parseInt(config.pageBackgroundColor.slice(5, 7), 16)}, ${config.pageBackgroundOpacity})`
    : 'transparent';

  if (!display) return (
    <div 
      className="fixed inset-0 z-50" 
      style={{ backgroundColor: pageBackground }} 
    />
  );

  const verticalPositionStyle =
    config.position === 'top'
      ? { top: `${config.marginTop + config.verticalOffset}px` }
      : config.position === 'middle'
        ? { top: '50%', transform: 'translateY(-50%)' }
        : { bottom: `${config.marginBottom + config.verticalOffset}px` };

  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[config.textAlign];

  const rawText = config.normalizeLineBreaks ? normalizeText(display.verseText) : display.verseText;

  // Lógica de separación de CORO / ULTIMO CORO
  const isCoro = rawText.includes('@CORO@');
  const coroHeader = isCoro ? (rawText.match(/@CORO@([^\n]*)/) ?? [])[1]?.trim() ?? '' : '';
  const displayTitle = isCoro ? (/ULTIMO/i.test(coroHeader) ? 'Último Coro' : 'Coro') : null;
  const cleanVerseText = isCoro ? rawText.replace(/@CORO@[^\n]*\n?/, '').trim() : rawText;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ backgroundColor: pageBackground, fontFamily: config.fontFamily }}
    >
      {/* Animation styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>

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
        ref={containerRef}
        className="absolute transition-all duration-300"
        style={{
          ...verticalPositionStyle,
          left: `${config.marginLeft + config.horizontalOffset}px`,
          right: `${config.marginRight}px`,
        }}
      >
        <div
          key={animationKey}
          className="animate-fade-in"
          style={{
            background: config.showPanel
              ? `rgba(${parseInt(config.panelBackground.slice(1, 3), 16)}, ${parseInt(config.panelBackground.slice(3, 5), 16)}, ${parseInt(config.panelBackground.slice(5, 7), 16)}, ${config.panelOpacity})`
              : 'transparent',
            border: config.showPanel ? `1px solid ${config.panelBorderColor}40` : 'none',
            borderRadius: config.showPanel ? '12px' : '0px',
            padding: `${config.padding}px`,
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
                  fontSize: `${Math.max(scaledFontSize * 0.5, 16)}px`,
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
          <div ref={textRef} className={textAlignClass}>
            <p
              style={{
                fontSize: `${scaledFontSize}px`,
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