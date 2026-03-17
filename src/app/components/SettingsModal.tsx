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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="glass-golden w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 glass-header p-2 sm:p-3 md:p-4 flex items-center justify-between border-b-2 border-accent/30 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
              Configuración Visual
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-accent transition-colors flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4">
          {/* ===== TEXTO DEL VERSO ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Texto del Verso</h3>

            {/* Tamaño de letra */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white/90 mb-1">
                Tamaño: <span className="text-accent">{config.fontSize}px</span>
              </label>
              <input
                type="range"
                min="16"
                max="120"
                step="1"
                value={config.fontSize}
                onChange={(e) => onConfigChange({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Color del texto */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white/90 mb-1">Color del Texto</label>
              <div className="flex gap-1 items-center">
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => onConfigChange({ textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-2 border-accent/40"
                />
                <input
                  type="text"
                  value={config.textColor}
                  onChange={(e) => onConfigChange({ textColor: e.target.value })}
                  className="glass-input flex-1 px-2 py-1 text-white text-xs"
                />
              </div>
            </div>

            {/* Alineación de texto */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white mb-1">Alineación</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: 'left', label: 'Izq' },
                  { value: 'center', label: 'Cen' },
                  { value: 'right', label: 'Der' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onConfigChange({
                        textAlign: option.value as 'left' | 'center' | 'right',
                      })
                    }
                    className={`py-1 rounded text-xs font-medium transition-all ${
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

            {/* Sombra de texto */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-white">Sombra</label>
              <label className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={config.textShadow}
                  onChange={(e) => onConfigChange({ textShadow: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
                <span className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>

            {/* Normalizar saltos */}
            <div className="flex items-center justify-between text-xs mt-2">
              <label className="font-medium text-white">Unir saltos (párrafos)</label>
              <label className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={config.normalizeLineBreaks}
                  onChange={(e) => onConfigChange({ normalizeLineBreaks: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
                <span className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>
          </div>

          {/* ===== TÍTULO DEL HIMNO ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Título del Himno</h3>

            {/* Mostrar título */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <label className="font-medium text-white">Mostrar Título</label>
              <label className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={config.showTitle}
                  onChange={(e) => onConfigChange({ showTitle: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
                <span className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>

            {/* Tamaño del título */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white/90 mb-1">
                Tamaño: <span className="text-accent">{config.titleFontSize}px</span>
              </label>
              <input
                type="range"
                min="12"
                max="60"
                step="1"
                value={config.titleFontSize}
                onChange={(e) => onConfigChange({ titleFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Color del título */}
            <div className="flex gap-1 items-center">
              <label className="text-xs font-medium text-white/90 w-12">Color</label>
              <input
                type="color"
                value={config.titleColor}
                onChange={(e) => onConfigChange({ titleColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-2 border-accent/40"
              />
              <input
                type="text"
                value={config.titleColor}
                onChange={(e) => onConfigChange({ titleColor: e.target.value })}
                className="glass-input flex-1 px-2 py-1 text-white text-xs"
              />
            </div>
          </div>

          {/* ===== PANEL/CONTENEDOR ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Panel Decorativo</h3>

            {/* Mostrar panel */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <label className="font-medium text-white">Mostrar Panel</label>
              <label className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={config.showPanel}
                  onChange={(e) => onConfigChange({ showPanel: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
                <span className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>

            {config.showPanel && (
              <>
                {/* Color del panel */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-white/90 mb-1 block">Color Fondo</label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={config.panelBackground}
                      onChange={(e) => onConfigChange({ panelBackground: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-2 border-accent/40"
                    />
                    <input
                      type="text"
                      value={config.panelBackground}
                      onChange={(e) => onConfigChange({ panelBackground: e.target.value })}
                      className="glass-input flex-1 px-2 py-1 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Opacidad del panel */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-white/90 mb-1">
                    Opacidad: <span className="text-accent">{Math.round(config.panelOpacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.panelOpacity}
                    onChange={(e) => onConfigChange({ panelOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Blur del panel */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-white/90 mb-1">
                    Desenfoque: <span className="text-accent">{config.panelBlur}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={config.panelBlur}
                    onChange={(e) => onConfigChange({ panelBlur: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Color del borde */}
                <div className="flex gap-1 items-center">
                  <label className="text-xs font-medium text-white/90 w-14">Borde</label>
                  <input
                    type="color"
                    value={config.panelBorderColor}
                    onChange={(e) => onConfigChange({ panelBorderColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-2 border-accent/40"
                  />
                  <input
                    type="text"
                    value={config.panelBorderColor}
                    onChange={(e) => onConfigChange({ panelBorderColor: e.target.value })}
                    className="glass-input flex-1 px-2 py-1 text-white text-xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* ===== POSICIONAMIENTO ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Posicionamiento</h3>

            {/* Posición vertical */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white mb-1">Posición Vertical</label>
              <div className="grid grid-cols-3 gap-1">
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
                    className={`py-1 rounded text-xs font-medium transition-all ${
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

            {/* Alineación horizontal */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white mb-1">Alineación Horizontal</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: 'left', label: 'Izq' },
                  { value: 'center', label: 'Centro' },
                  { value: 'right', label: 'Der' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onConfigChange({
                        horizontalAlignment: option.value as 'left' | 'center' | 'right',
                      })
                    }
                    className={`py-1 rounded text-xs font-medium transition-all ${
                      config.horizontalAlignment === option.value
                        ? 'bg-[#C5A021] text-black'
                        : 'bg-[#333] text-white hover:bg-[#444]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offsets */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Offset V: <span className="text-accent">{config.verticalOffset}px</span>
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={config.verticalOffset}
                  onChange={(e) => onConfigChange({ verticalOffset: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Offset H: <span className="text-accent">{config.horizontalOffset}px</span>
                </label>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="5"
                  value={config.horizontalOffset}
                  onChange={(e) => onConfigChange({ horizontalOffset: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            {/* Márgenes */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Margen Arriba: <span className="text-accent">{config.marginTop}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={config.marginTop}
                  onChange={(e) => onConfigChange({ marginTop: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Margen Abajo: <span className="text-accent">{config.marginBottom}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={config.marginBottom}
                  onChange={(e) => onConfigChange({ marginBottom: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Margen Izq: <span className="text-accent">{config.marginLeft}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={config.marginLeft}
                  onChange={(e) => onConfigChange({ marginLeft: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/90 mb-1">
                  Margen Der: <span className="text-accent">{config.marginRight}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={config.marginRight}
                  onChange={(e) => onConfigChange({ marginRight: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          {/* ===== ESPACIADO Y TAMAÑO ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Espaciado y Tamaño</h3>

            {/* Padding interno */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white/90 mb-1">
                Padding Interno: <span className="text-accent">{config.padding}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={config.padding}
                onChange={(e) => onConfigChange({ padding: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Ancho máximo */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-white/90 mb-1">
                Ancho Máximo: <span className="text-accent">{config.maxWidth}px</span>
              </label>
              <input
                type="range"
                min="180"
                max="3840"
                step="50"
                value={config.maxWidth}
                onChange={(e) => onConfigChange({ maxWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Gradiente de fondo */}
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-white">Gradiente Visual</label>
              <label className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  checked={config.showBackgroundGradient}
                  onChange={(e) => onConfigChange({ showBackgroundGradient: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="absolute inset-0 bg-[#555] rounded-full peer-checked:bg-[#C5A021] transition-colors"></span>
                <span className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
              </label>
            </div>
          </div>

          {/* ===== FUENTE ===== */}
          <div className="bg-[#333]/50 p-2 sm:p-3 rounded-lg">
            <h3 className="text-xs sm:text-sm font-bold text-accent mb-2">Tipo de Fuente</h3>
            <select
              value={config.fontFamily}
              onChange={(e) => onConfigChange({ fontFamily: e.target.value })}
              className="glass-input w-full px-2 py-1.5 text-white text-xs"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              <option value="'Verdana', sans-serif">Verdana</option>
              <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#C5A021]/30 p-2 sm:p-3">
          <button
            onClick={onClose}
            className="w-full bg-[#C5A021] hover:bg-[#d4af2a] text-black font-bold py-1.5 sm:py-2 rounded transition-colors text-xs sm:text-sm"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
