import { useEffect, useState, useRef } from 'react';
import { Eye, EyeOff, Music, Search, Sliders, Bookmark, Trash2, ListMusic } from 'lucide-react';
import { hymnbooks, searchHymns, Hymn } from '../data/hymns';
import {
  HymnBroadcaster,
  DisplayConfig,
  getStoredConfig,
  HymnDisplay,
} from '../utils/broadcast';
import { SettingsModal } from '../components/SettingsModal';

type WindowTab = 'search' | 'hymn' | 'saved' | 'settings';

interface SavedHymn {
  hymnbookId: string;
  hymnbookName: string;
  hymn: Hymn;
}

const isSavedHymnEntry = (entry: unknown): entry is SavedHymn => {
  if (!entry || typeof entry !== 'object') return false;
  const candidate = entry as SavedHymn;
  return (
    typeof candidate.hymnbookId === 'string' &&
    typeof candidate.hymnbookName === 'string' &&
    candidate.hymn &&
    typeof candidate.hymn.number === 'number' &&
    typeof candidate.hymn.title === 'string' &&
    Array.isArray(candidate.hymn.verses) &&
    candidate.hymn.verses.every((verse) => typeof verse === 'string')
  );
};

const loadSavedHymns = (): SavedHymn[] => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return [];
  const stored = window.localStorage.getItem('obs-saved-hymns');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedHymnEntry);
  } catch (error) {
    console.warn('[ControlPage] limpieza de himnos guardados fallida:', error);
    return [];
  }
};

export default function ControlPage() {
  const [activeTab, setActiveTab] = useState<WindowTab>('search');
  const [hymnbookId, setHymnbookId] = useState('celebremos_su_gloria');
  
  const [hymnSearchQuery, setHymnSearchQuery] = useState('');
  
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [searchResults, setSearchResults] = useState<Hymn[]>([]);
  
  // activeVerseIndex = Lo que está en vivo en OBS
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  // focusedVerseIndex = Lo que está resaltado localmente para navegar
  const [focusedVerseIndex, setFocusedVerseIndex] = useState<number | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<DisplayConfig>(getStoredConfig());
  const [broadcaster] = useState(() => new HymnBroadcaster());

  // Estado para los himnos guardados (persiste en localStorage)
  const [savedHymns, setSavedHymns] = useState<SavedHymn[]>(() => loadSavedHymns());

  const verseRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Guardar en localStorage cuando cambie la lista de guardados
  useEffect(() => {
    localStorage.setItem('obs-saved-hymns', JSON.stringify(savedHymns));
  }, [savedHymns]);

  // Cargar todos los himnos del himnario seleccionado para la búsqueda
  useEffect(() => {
    const results = searchHymns(hymnbookId, '');
    const sortedResults = results.sort((a, b) => a.number - b.number);
    setSearchResults(sortedResults);
  }, [hymnbookId]);

  // Atajos de teclado globales (Ctrl + 1, 2, 3, 4)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('search'); setShowSettings(false); }
        if (e.key === '2') { e.preventDefault(); if (selectedHymn) setActiveTab('hymn'); setShowSettings(false); }
        if (e.key === '3') { e.preventDefault(); setActiveTab('saved'); setShowSettings(false); }
        if (e.key === '4') { e.preventDefault(); setActiveTab('settings'); }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedHymn]);

  // Navegación con teclado (solo en ventana de himno)
  useEffect(() => {
    if (activeTab !== 'hymn' || !selectedHymn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) return; // Evitar conflictos con los atajos globales

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedVerseIndex((prev) => {
          const next = Math.min((prev ?? -1) + 1, selectedHymn.verses.length - 1);
          // Si ya está al aire, cambiar y transmitir automáticamente
          if (activeVerseIndex !== null) handleShowVerse(next, false);
          return next;
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedVerseIndex((prev) => {
          const next = Math.max((prev ?? 0) - 1, 0);
          // Si ya está al aire, cambiar y transmitir automáticamente
          if (activeVerseIndex !== null) handleShowVerse(next, false);
          return next;
        });
        return;
      }
      
      // Enter y Punto (.) actúan como confirmación (Toggle al aire)
      if (e.key === '.' || e.key === 'Enter') {
        e.preventDefault();
        if (activeVerseIndex !== null) {
          handleHideAll(); // Si hay algo, lo quita
        } else {
          // Si no hay nada, pone al aire el que esté enfocado
          handleShowVerse(focusedVerseIndex ?? 0, true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedHymn, activeVerseIndex, focusedVerseIndex]);

  // Centrar el scroll en la estrofa enfocada (focused)
  useEffect(() => {
    if (focusedVerseIndex !== null && verseRefs.current[focusedVerseIndex]) {
      verseRefs.current[focusedVerseIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusedVerseIndex]);

  const handleSelectHymn = (hymn: Hymn, bookId: string = hymnbookId) => {
    setHymnbookId(bookId);
    setSelectedHymn(hymn);
    setActiveTab('hymn');
    setHymnSearchQuery('');
    setActiveVerseIndex(null);
    setFocusedVerseIndex(0); // Enfocar la primera estrofa por defecto, pero no transmitirla
    broadcaster.clearDisplay();
  };

  const handleShowVerse = (verseIndex: number, updateFocus: boolean = true) => {
    if (!selectedHymn) return;
    const clampedIndex = Math.max(0, Math.min(verseIndex, selectedHymn.verses.length - 1));
    const display: HymnDisplay = {
      hymnbookId,
      hymnNumber: selectedHymn.number,
      hymnTitle: selectedHymn.title,
      verseIndex: clampedIndex,
      verseText: selectedHymn.verses[clampedIndex],
      config,
    };
    broadcaster.sendDisplay(display);
    setActiveVerseIndex(clampedIndex);
    if (updateFocus) setFocusedVerseIndex(clampedIndex);
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

  const toggleSaveHymn = () => {
    if (!selectedHymn) return;
    const isSaved = savedHymns.some(sh => sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number);
    if (isSaved) {
      setSavedHymns(savedHymns.filter(sh => !(sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number)));
    } else {
      setSavedHymns([...savedHymns, { hymnbookId, hymnbookName: hymnbooks[hymnbookId].name, hymn: selectedHymn }]);
    }
  };

  const removeSavedHymn = (bookId: string, hymnNum: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se seleccione el himno al hacer clic en borrar
    setSavedHymns(savedHymns.filter(sh => !(sh.hymnbookId === bookId && sh.hymn.number === hymnNum)));
  };

  const filteredHymns = searchResults.filter(
    (hymn) =>
      hymn.title.toLowerCase().includes(hymnSearchQuery.toLowerCase()) ||
      hymn.number.toString().includes(hymnSearchQuery)
  );

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col relative">
      {/* Fondo con gradiente decorativo estilo HomePage */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at center, rgba(197, 160, 33, 0.2) 0%, transparent 80%)`,
        }}
      />

      {/* Header (fixed) */}
      <div className="flex-none z-20 glass-panel border-b border-accent/20 p-3 relative">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-accent-glow truncate leading-tight">
              Control de Himnos
            </h1>
            <p className="text-[10px] text-white/50 truncate flex gap-2 mt-0.5">
              <span>Ctrl+1 Búsqueda</span>
              <span>Ctrl+2 Himno</span>
              <span>Ctrl+3 Guardados</span>
            </p>
          </div>
          <div className="hidden sm:block text-[10px] text-white/50 text-right leading-tight">
            <div>↑ ↓ navega</div>
            <div>
              <span className="inline-flex items-center justify-center px-1.5 rounded glass-subtle border border-accent/20 text-white/70">
                . / ↵
              </span>{' '}
              transmite
            </div>
          </div>
        </div>
      </div>

      {/* Content (Responsive, scroll interno manejado por pestañas) */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="w-full h-full">
          
          {/* Tab: Search */}
          {activeTab === 'search' && (
            <div className="flex flex-col h-full p-3 space-y-3">
              <div className="space-y-1.5 flex-none">
                <label className="block text-[11px] font-medium text-white/70">
                  Himnario
                </label>
                <select
                  value={hymnbookId}
                  onChange={(e) => {
                    setHymnbookId(e.target.value);
                    setHymnSearchQuery('');
                  }}
                  className="w-full rounded-md glass-subtle border border-accent/20 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 appearance-none [&>option]:bg-black"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%23C5A021%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.8rem' }}
                >
                  {Object.entries(hymnbooks).map(([id, book]) => (
                    <option key={id} value={id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent/70" />
                <input
                  type="text"
                  placeholder="Buscar número o título..."
                  value={hymnSearchQuery}
                  onChange={(e) => setHymnSearchQuery(e.target.value)}
                  className="w-full glass-subtle border border-accent/20 rounded-md pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-white/30"
                  autoFocus
                />
              </div>

              {/* Lista integrada con Scroll interno */}
              <div className="flex-1 overflow-y-auto rounded-md border border-accent/20 glass-panel [scrollbar-width:thin] [scrollbar-color:theme(colors.accent)_transparent]">
                {filteredHymns.length > 0 ? (
                  filteredHymns.map((hymn) => (
                    <button
                      key={hymn.number}
                      onClick={() => handleSelectHymn(hymn)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-accent/10 focus:bg-accent/10 focus:outline-none transition-colors flex items-center gap-2 border-b border-accent/10 last:border-0"
                    >
                      <span className="text-accent font-bold min-w-[2.2rem]">#{hymn.number}</span>
                      <span className="text-white/90 truncate flex-1">{hymn.title}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[11px] text-white/40">
                    No se encontraron himnos.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Saved (Guardados) */}
          {activeTab === 'saved' && (
            <div className="flex flex-col h-full p-3 space-y-3">
              <div className="rounded-lg glass-panel border border-accent/20 p-3 flex items-center gap-2 flex-none">
                <Bookmark className="w-4 h-4 text-accent" />
                <div>
                  <h2 className="text-sm font-bold text-white">Himnos Guardados</h2>
                  <p className="text-[10px] text-white/50">Lista rápida para la reunión de hoy</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2">
                {savedHymns.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-accent/30 rounded-lg glass-subtle">
                    <p className="text-xs text-white/40">No hay himnos guardados aún.</p>
                    <p className="text-[10px] text-white/30 mt-1">Busca un himno y usa el icono de guardar.</p>
                  </div>
                ) : (
                  savedHymns.map((saved, idx) => (
                    <div key={`${saved.hymnbookId}-${saved.hymn.number}-${idx}`} className="flex gap-2">
                      <button
                        onClick={() => handleSelectHymn(saved.hymn, saved.hymnbookId)}
                        className="flex-1 text-left rounded-md glass-subtle border border-accent/20 p-2 hover:border-accent/50 transition-all focus:outline-none"
                      >
                        <div className="text-[9px] text-accent/80 mb-0.5">{saved.hymnbookName}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-accent font-bold">#{saved.hymn.number}</span>
                          <span className="text-white/90 truncate">{saved.hymn.title}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => removeSavedHymn(saved.hymnbookId, saved.hymn.number, e)}
                        className="flex-none flex items-center justify-center px-3 rounded-md glass-subtle border border-accent/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all"
                        title="Eliminar de guardados"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Hymn */}
          {activeTab === 'hymn' && selectedHymn && (
            <div className="h-full overflow-y-auto p-3 space-y-3 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="rounded-lg glass-panel border border-accent/20 p-3 sticky top-0 z-10 shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-accent">
                      Himno #{selectedHymn.number}
                    </div>
                    <h2 className="text-sm font-bold text-white mt-0.5 truncate">
                      {selectedHymn.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 flex-none">
                    <button
                      onClick={toggleSaveHymn}
                      className={`p-1.5 rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50 ${
                        savedHymns.some(sh => sh.hymnbookId === hymnbookId && sh.hymn.number === selectedHymn.number)
                          ? 'bg-accent/20 border-accent/50 text-accent'
                          : 'glass-subtle border-accent/20 text-white/50 hover:text-white'
                      }`}
                      title="Guardar himno"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleHideAll}
                      disabled={activeVerseIndex === null}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-colors text-[11px] whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-accent/50 ${
                        activeVerseIndex !== null
                          ? 'glass-subtle border-accent/40 text-white hover:border-accent'
                          : 'bg-black/50 border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                      title="Ocultar (Enter o .)"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Ocultar
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                {selectedHymn.verses.map((verse, index) => {
                  const isActive = activeVerseIndex === index;
                  const isFocused = focusedVerseIndex === index;
                  
                  return (
                    <button
                      key={index}
                      ref={(el) => {
                        verseRefs.current[index] = el;
                      }}
                      onClick={() => {
                        if (isActive) {
                          handleHideAll();
                        } else {
                          handleShowVerse(index, true);
                        }
                      }}
                      className={`w-full text-left rounded-lg border p-2.5 transition-all duration-300 focus:outline-none backdrop-blur-md ${
                        isActive
                          ? 'bg-accent/15 border-accent/60 shadow-[0_0_20px_rgba(197,160,33,0.25)]' // <- Estética Premium Glass y Dorado Transparente
                          : isFocused
                            ? 'bg-white/10 border-white/30 text-white' 
                            : 'bg-black/40 border-white/5 text-white/80 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`min-w-[1.75rem] h-6 rounded flex items-center justify-center font-bold text-[11px] ${
                            isActive
                              ? 'bg-accent/20 text-accent border border-accent/30'
                              : isFocused
                                ? 'bg-white/20 text-white'
                                : 'bg-black/50 border border-white/10 text-white/50'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p
                            className={`whitespace-pre-line leading-snug text-[11px] sm:text-xs ${
                              isActive ? 'text-white font-semibold' : 'text-white/80'
                            }`}
                          >
                            {verse}
                          </p>
                        </div>
                        {isActive && (
                          <Eye className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto p-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="rounded-lg glass-panel border border-accent/20 p-3 flex items-center gap-2.5 relative z-10">
                <div className="p-1.5 bg-accent/20 rounded-md">
                  <Sliders className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Configuración Visual</h2>
                  <p className="text-[10px] text-white/50">Ajustes rápidos de la transmisión</p>
                </div>
              </div>

              <div className="rounded-lg glass-panel border border-accent/20 p-3 space-y-5 relative z-10">
                
                {/* Sliders reparados (sin el appearance-none que los rompía) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-medium text-white/90">
                      Tamaño de fuente
                    </label>
                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
                      {config.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="150"
                    value={config.fontSize}
                    onChange={(e) => handleConfigChange({ fontSize: parseInt(e.target.value) || 24 })}
                    className="w-full cursor-pointer accent-accent"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-medium text-white/90">
                      Ancho del párrafo (Expandir)
                    </label>
                    <span className="text-[10px] font-mono text-accent bg-black/50 border border-accent/20 px-1.5 py-0.5 rounded">
                      {config.maxWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="3840"
                    step="50"
                    value={config.maxWidth}
                    onChange={(e) => handleConfigChange({ maxWidth: parseInt(e.target.value) || 1000 })}
                    className="w-full cursor-pointer accent-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-white/90">
                    Posición en pantalla
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'middle', 'bottom'] as const).map((pos) => {
                      const isSelected = config.position === pos;
                      const labels = { top: 'Arriba', middle: 'Centro', bottom: 'Abajo' };
                      return (
                        <button
                          key={pos}
                          onClick={() => handleConfigChange({ position: pos })}
                          className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-accent/20 border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]'
                              : 'glass-subtle border-accent/20 text-white/70 hover:border-accent/50'
                          }`}
                        >
                          {labels[pos]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full rounded-md glass-subtle border border-accent/30 py-2.5 text-accent font-medium text-[11px] transition-all hover:border-accent hover:bg-accent/10 focus:outline-none focus:ring-1 focus:ring-accent/50"
                  >
                    Abrir opciones avanzadas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav (fixed) */}
      <div className="flex-none z-20 glass-panel border-t border-accent/20 p-2 pb-safe relative">
        <div className="max-w-3xl mx-auto flex items-center justify-around gap-1.5">
          <button
            onClick={() => { setActiveTab('search'); setShowSettings(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
              activeTab === 'search' 
                ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
            }`}
            title="Buscar (Ctrl+1)"
          >
            <Search className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Buscar</span>
          </button>

          <button
            onClick={() => { if (selectedHymn) { setActiveTab('hymn'); setShowSettings(false); } }}
            disabled={!selectedHymn}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
              activeTab === 'hymn' 
                ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                : selectedHymn 
                  ? 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30' 
                  : 'bg-transparent border-transparent text-white/20 cursor-not-allowed'
            }`}
            title="Himno actual (Ctrl+2)"
          >
            <Music className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Himno</span>
          </button>

          <button
            onClick={() => { setActiveTab('saved'); setShowSettings(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
              activeTab === 'saved' 
                ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
            }`}
            title="Guardados (Ctrl+3)"
          >
            <ListMusic className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Guardados</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md border transition-all focus:outline-none ${
              activeTab === 'settings' 
                ? 'glass-subtle border-accent/50 text-accent shadow-[0_0_10px_rgba(197,160,33,0.2)]' 
                : 'bg-transparent border-transparent text-white/50 hover:text-white/80 hover:glass-subtle hover:border-accent/30'
            }`}
            title="Ajustes (Ctrl+4)"
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Ajustes</span>
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}