import { Link } from 'react-router';
import { Monitor, Settings, Music, Book, Zap, Projector } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-auto">
      {/* Fondo con gradiente decorativo */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, rgba(197, 160, 33, 0.2) 0%, transparent 80%)`,
        }}
      />

      <div className="relative max-w-5xl w-full z-10">
        {/* Encabezado */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="mb-4 sm:mb-5 md:mb-6 flex justify-center">
            <Music className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-glow mb-2 sm:mb-3 md:mb-4">
            Plugin de Himnos
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto px-2">
            Muestra las letras de himnos en pantalla durante tus transmisiones en vivo con OBS Studio
          </p>
        </div>

        {/* Grid de opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          {/* Panel de Control */}
          <Link
            to="/control"
            className="glass-panel group p-4 sm:p-5 md:p-6 lg:p-8 hover:shadow-lg transition-all hover:border-accent/50"
          >
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              <div className="bg-accent p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Panel de Control</h2>
            </div>
            <p className="text-white/70 leading-relaxed text-sm sm:text-base">
              Abre este panel como un <strong className="text-white/90">Custom Browser Dock</strong> en
              OBS para controlar qué himno y párrafo se muestra en pantalla. Busca, selecciona y navega
              con facilidad.
            </p>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-accent/20 flex items-center gap-1 sm:gap-2 text-accent text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Acceso rápido recomendado
            </div>
          </Link>

          {/* Vista de Display */}
          <Link
            to="/display"
            className="glass-panel group p-4 sm:p-5 md:p-6 lg:p-8 hover:shadow-lg transition-all hover:border-accent/50"
          >
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              <div className="bg-accent p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Vista de Display</h2>
            </div>
            <p className="text-white/70 leading-relaxed text-sm sm:text-base">
              Agrega esta página como un <strong className="text-white/90">Browser Source</strong> en tu
              escena de OBS para mostrar los himnos en pantalla con elegancia
              y glassmorphism.
            </p>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-accent/20 flex items-center gap-1 sm:gap-2 text-accent text-xs sm:text-sm">
              <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
              Pantalla en vivo
            </div>
          </Link>

          {/* Vista de Proyección */}
          <Link
            to="/projection"
            className="glass-panel group p-4 sm:p-5 md:p-6 lg:p-8 hover:shadow-lg transition-all hover:border-accent/50"
          >
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              <div className="bg-accent/20 border border-accent/30 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                <Projector className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-accent" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Vista de Proyección</h2>
            </div>
            <p className="text-white/70 leading-relaxed text-sm sm:text-base">
              Proyección enriquecida con <strong className="text-white/90">fondos visuales</strong> para
              pantallas adicionales o proyectores. Se sincroniza con el mismo Panel de Control en tiempo real.
            </p>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-accent/20 flex items-center gap-1 sm:gap-2 text-accent text-xs sm:text-sm">
              <Projector className="w-3 h-3 sm:w-4 sm:h-4" />
              Pantalla de proyección
            </div>
          </Link>
        </div>

        {/* Instrucciones */}
        <div className="glass-panel p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
            <Book className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              📋 Cómo usar en OBS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Paso 1 */}
            <div className="glass-subtle p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  1
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Display</h4>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Agrega un <code className="bg-black/50 px-2 py-1 rounded text-accent text-xs">
                  Browser Source
                </code> con la URL de display
              </p>
            </div>

            {/* Paso 2 */}
            <div className="glass-subtle p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  2
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Panel</h4>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Abre un <code className="bg-black/50 px-2 py-1 rounded text-accent text-xs">
                  Custom Browser Dock
                </code> con la URL de control
              </p>
            </div>

            {/* Paso 3 */}
            <div className="glass-subtle p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                  3
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base">¡Listo!</h4>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Busca, selecciona párrafos y transmite con estilo
              </p>
            </div>
          </div>

          {/* URLs */}
          <div className="mt-6 sm:mt-7 md:mt-8 pt-6 sm:pt-7 md:pt-8 border-t border-accent/20 space-y-3 sm:space-y-4">
            <div className="glass-subtle p-3 sm:p-4 rounded-lg">
              <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">URL del Display:</p>
              <code className="text-accent break-all text-xs sm:text-sm">
                {window.location.origin}/display
              </code>
            </div>
            <div className="glass-subtle p-3 sm:p-4 rounded-lg">
              <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">URL de Proyección:</p>
              <code className="text-accent break-all text-xs sm:text-sm">
                {window.location.origin}/projection
              </code>
            </div>
            <div className="glass-subtle p-3 sm:p-4 rounded-lg">
              <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">URL del Control:</p>
              <code className="text-accent break-all text-xs sm:text-sm">
                {window.location.origin}/control
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center text-white/40 text-xs sm:text-sm px-2">
          <p>🎵 Desarrollado para facilitar la presentación de himnos en transmisiones en vivo</p>
        </div>
      </div>
    </div>
  );
}