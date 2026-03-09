import { useState, useEffect } from 'react';
import { Search, Settings, Eye, EyeOff, Music, Sliders } from 'lucide-react';
import { hymnbooks, searchHymns, Hymn } from '../data/hymns';
import {
  HymnBroadcaster,
  DisplayConfig,
  getStoredConfig,
  HymnDisplay,
} from '../utils/broadcast';
import { SettingsModal } from '../components/SettingsModal';

type WindowTab = 'search' | 'hymn' | 'settings';

export default function ControlPage() {
  const [activeTab, setActiveTab] = useState<WindowTab>('search');
  const [hymnbookId, setHymnbookId] = useState('celebremos_su_gloria');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [searchResults, setSearchResults] = useState<Hymn[]>([]);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig());
  const [broadcaster] = useState(() => new HymnBroadcaster());

  // Búsqueda de himnos
  useEffect(() => {
    const results = searchHymns(hymnbookId, searchQuery);
    // Ordenar por número
    const sortedResults = results.sort((a, b) => a.number - b.number);
    setSearchResults(sortedResults.slice(0, 20)); // Mostrar hasta 20 resultados
  }, [searchQuery, hymnbookId]);

  // Navegación con teclado (flechas arriba/abajo) en la ventana del himno
  useEffect(() => {
    if (activeTab !== 'hymn' || !selectedHymn) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex =
          activeVerseIndex === null
            ? 0
            : Math.min(activeVerseIndex + 1, selectedHymn.verses.length - 1);
        handleShowVerse(nextIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeVerseIndex !== null && activeVerseIndex > 0) {
          handleShowVerse(activeVerseIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedHymn, activeVerseIndex]);

  const handleSelectHymn = (hymn: Hymn) => {
    setSelectedHymn(hymn);
    setActiveTab('hymn');
    setSearchQuery('');
    setSearchResults([]);
    setActiveVerseIndex(null);
    broadcaster.clearDisplay();
  };

  const handleShowVerse = (verseIndex: number) => {
    if (!selectedHymn) return;

    const display: HymnDisplay = {
      hymnbookId,
      hymnNumber: selectedHymn.number,
      hymnTitle: selectedHymn.title,
      verseIndex,
      verseText: selectedHymn.verses[verseIndex],
      config,
    };

    broadcaster.sendDisplay(display);
    setActiveVerseIndex(verseIndex);
  };

  const handleHideAll = () => {
    broadcaster.clearDisplay();
    setActiveVerseIndex(null);
  };

  const handleConfigChange = (newConfig: Partial<DisplayConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    broadcaster.sendConfig(updatedConfig);
  };

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col">
      {/* Header con Glassmorphism */}
      <div className="glass-header p-4 sm:p-5 md:p-6">
        <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-accent-glow">
          Control de Himnos
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">
          OBS Studio Plugin • Sistema de Himnos
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto glass-scroll p-4 sm:p-5 md:p-6">
          {/* Ventana de Búsqueda */}
          {activeTab === 'search' && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-4">
              {/* Selector de himnario */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
                  Himnario
                </label>
                <select
                  value={hymnbookId}
                  onChange={(e) => setHymnbookId(e.target.value)}
                  className="glass-input w-full px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base"
                >
                  {Object.entries(hymnbooks).map(([id, book]) => (
                    <option key={id} value={id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buscador */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
                  Buscar Himno
                </label>
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-accent/60" />
                  <input
                    type="text"
                    placeholder="Número o título del himno..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-white text-sm sm:text-base"
                    autoFocus
                  />
                </div>

                {/* Resultados con Glassmorphism */}
                {searchResults.length > 0 && (
                  <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                    {searchResults.map((hymn) => (
                      <button
                        key={hymn.number}
                        onClick={() => handleSelectHymn(hymn)}
                        className="glass-item w-full text-left px-3 sm:px-4 py-2 sm:py-3 transition-all hover:shadow-lg text-sm sm:text-base"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-accent font-bold text-sm sm:text-lg min-w-[2.5rem] sm:min-w-[3.5rem]">
                            #{hymn.number}
                          </span>
                          <span className="text-white/90 flex-1 truncate">
                            {hymn.title}
                          </span>
                          <span className="text-white/40 text-xs sm:text-sm whitespace-nowrap">
                            {hymn.verses.length} párr.
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <div className="mt-6 text-center text-white/40 py-8">
                    <Music className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">No se encontraron himnos</p>
                  </div>
                )}

                {!searchQuery && searchResults.length === 0 && (
                  <div className="mt-6 text-center text-white/40 py-8">
                    <Music className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">Escribe el número o nombre de un himno</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ventana del Himno */}
          {activeTab === 'hymn' && selectedHymn && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-4">
              {/* Header del himno */}
              <div className="glass-panel p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <span className="text-accent font-bold text-sm sm:text-base">
                      Himno #{selectedHymn.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2">
                      {selectedHymn.title}
                    </h2>
                  </div>
                  <button
                    onClick={handleHideAll}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                      activeVerseIndex !== null
                        ? 'glass-button text-accent'
                        : 'bg-[#333] text-white/40 cursor-not-allowed'
                    }`}
                    disabled={activeVerseIndex === null}
                    title="Ocultar todo el himno del display"
                  >
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                    Ocultar
                  </button>
                </div>

                <div className="glass-divider mt-3 sm:mt-4" />

                {/* Instrucción de teclado */}
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs sm:text-sm text-white/80 text-center">
                  💡 Usa <kbd className="px-2 py-1 bg-accent/20 rounded">↑</kbd> <kbd className="px-2 py-1 bg-accent/20 rounded">↓</kbd> para navegar entre párrafos • <kbd className="px-2 py-1 bg-accent/20 rounded">.</kbd> para ocultar/mostrar
                </div>
              </div>

              {/* Lista de párrafos */}
              <div className="space-y-1 sm:space-y-2">
                {selectedHymn.verses.map((verse, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      activeVerseIndex === index
                        ? handleHideAll()
                        : handleShowVerse(index)
                    }
                    className={`glass-item w-full text-left p-3 sm:p-4 transition-all ${
                      activeVerseIndex === index ? 'active' : ''
                    }`}
                    title={`Mostrar párrafo ${index + 1} en el display`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 sm:gap-4">
                      <div
                        className={`min-w-[2rem] sm:min-w-[2.5rem] h-8 sm:h-10 rounded-lg flex items-center justify-center font-bold transition-colors flex-shrink-0 text-sm sm:text-base ${
                          activeVerseIndex === index
                            ? 'bg-accent text-black'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`whitespace-pre-line leading-relaxed transition-colors text-xs sm:text-sm ${
                            activeVerseIndex === index
                              ? 'text-white'
                              : 'text-white/70'
                          }`}
                        >
                          {verse.slice(0, 80)}
                          {verse.length > 80 ? '...' : ''}
                        </p>
                      </div>
                      {activeVerseIndex === index && (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ventana de Configuraciones */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-4 sm:p-5 md:p-6 max-w-2xl">
              <div className="flex items-center gap-3 mb-4 sm:mb-5 md:mb-6">
                <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Configuración</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
                    Tamaño de Fuente
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={config.fontSize}
                    onChange={(e) =>
                      handleConfigChange({ fontSize: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    Actual: {config.fontSize}px
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/90 mb-2 sm:mb-3">
                    Posición
                  </label>
                  <div className="space-y-1 sm:space-y-2">
                    {['top', 'middle', 'bottom'].map((pos) => (
                      <label key={pos} className="flex items-center gap-2 sm:gap-3 cursor-pointer text-xs sm:text-sm">
                        <input
                          type="radio"
                          name="position"
                          value={pos}
                          checked={config.position === pos}
                          onChange={(e) =>
                            handleConfigChange({
                              position: e.target.value as any,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-white/80 capitalize">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowSettings(true)}
                  className="glass-button w-full py-2 sm:py-3 text-accent font-medium transitions-all hover:text-white text-sm sm:text-base"
                >
                  Más opciones
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Ventanas / Tabs */}
      <div className="glass-tabs p-2 sm:p-3 md:p-4 flex gap-1 sm:gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('search');
            setShowSettings(false);
          }}
          className={`glass-tab px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'search' ? 'active' : ''
          }`}
        >
          <Search className="w-3 h-3 sm:w-4 sm:h-4" />
          Búsqueda
        </button>

        {selectedHymn && (
          <button
            onClick={() => {
              setActiveTab('hymn');
              setShowSettings(false);
            }}
            className={`glass-tab px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'hymn' ? 'active' : ''
            }`}
          >
            <Music className="w-3 h-3 sm:w-4 sm:h-4" />
            Himno
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setActiveTab('settings')}
          className={`glass-tab px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'settings' ? 'active' : ''
          }`}
        >
          <Sliders className="w-3 h-3 sm:w-4 sm:h-4" />
          Configuración
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}