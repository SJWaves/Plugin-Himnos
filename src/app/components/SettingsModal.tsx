import { X, Sliders } from 'lucide-react';
import { DisplayConfig } from '../utils/broadcast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DisplayConfig;
  onConfigChange: (config: Partial<DisplayConfig>) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="glass-golden w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 glass-header p-3 sm:p-4 md:p-6 flex items-center justify-between border-b-2 border-accent/30 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
              Configuración Visual
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-accent transition-colors flex-shrink-0"
            title="Cerrar configuración"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Tamaño de letra */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
              Tamaño de Letra: <span className="text-accent">{config.fontSize}px</span>
            </label>
            <input
              type="range"
              min="24"
              max="96"
              step="2"
              value={config.fontSize}
              onChange={(e) =>
                onConfigChange({ fontSize: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1 sm:mt-2">
              <span>24px</span>
              <span>96px</span>
            </div>
          </div>

          {/* Color del texto */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
              Color del Texto
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
              <input
                type="color"
                value={config.textColor}
                onChange={(e) => onConfigChange({ textColor: e.target.value })}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg cursor-pointer border-2 border-accent/40 flex-shrink-0"
              />
              <input
                type="text"
                value={config.textColor}
                onChange={(e) => onConfigChange({ textColor: e.target.value })}
                className="glass-input flex-1 px-3 sm:px-4 py-2 sm:py-2 text-white text-xs sm:text-base"
              />
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
              Color de Fondo
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
              <input
                type="color"
                value={config.backgroundColor.replace(/rgba?\([^)]+\)/, '#000000')}
                onChange={(e) =>
                  onConfigChange({ backgroundColor: `${e.target.value}B3` })
                }
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg cursor-pointer border-2 border-accent/40 flex-shrink-0"
              />
              <select
                value={config.backgroundColor.slice(-2)}
                onChange={(e) => {
                  const color = config.backgroundColor.slice(0, 7);
                  onConfigChange({ backgroundColor: `${color}${e.target.value}` });
                }}
                className="glass-input flex-1 px-3 sm:px-4 py-2 sm:py-2 text-white text-xs sm:text-base"
              >
                <option value="00">Transparente</option>
                <option value="40">25% Opacidad</option>
                <option value="80">50% Opacidad</option>
                <option value="B3">70% Opacidad</option>
                <option value="E6">90% Opacidad</option>
                <option value="FF">100% Opacidad</option>
              </select>
            </div>
          </div>

          {/* Alineación */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
              Alineación de Texto
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'left', label: 'Izquierda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Derecha' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onConfigChange({
                      textAlign: option.value as 'left' | 'center' | 'right',
                    })
                  }
                  className={`py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                    config.textAlign === option.value
                      ? 'bg-[#C5A021] text-black'
                      : 'bg-[#333] text-white hover:bg-[#444]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posición */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
              Posición en Pantalla
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'top', label: 'Arriba' },
                { value: 'middle', label: 'Centro' },
                { value: 'bottom', label: 'Abajo' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onConfigChange({
                      position: option.value as 'top' | 'middle' | 'bottom',
                    })
                  }
                  className={`py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                    config.position === option.value
                      ? 'bg-[#C5A021] text-black'
                      : 'bg-[#333] text-white hover:bg-[#444]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sombra de texto */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-[#333]/50 rounded-lg">
            <label htmlFor="textShadow" className="text-xs sm:text-sm font-medium text-white">
              Sombra en el Texto
            </label>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                id="textShadow"
                checked={config.textShadow}
                onChange={(e) =>
                  onConfigChange({ textShadow: e.target.checked })
                }
                className="sr-only peer"
              />
              <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></span>
            </label>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-2 sm:mb-3">
              Espaciado Interno: {config.padding}px
            </label>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={config.padding}
              onChange={(e) =>
                onConfigChange({ padding: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#C5A021]"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>0px</span>
              <span>80px</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#C5A021]/30 p-3 sm:p-4 md:p-6">
          <button
            onClick={onClose}
            className="w-full bg-[#C5A021] hover:bg-[#d4af2a] text-black font-bold py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
