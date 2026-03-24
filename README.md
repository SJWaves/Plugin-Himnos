# Himnos OBS — Sistema de Himnos para OBS Studio

Panel de control y visualizador de himnos para transmisiones en vivo con OBS Studio. Tres vistas sincronizadas en tiempo real: panel de control para el operador, overlay transparente para OBS, y pantalla de proyección con fondos visuales.

---

## 🗺️ Rutas de la Aplicación

| Ruta | Propósito | Descripción |
|---|---|---|
| `/` | Página de inicio | URLs, instrucciones y acceso rápido a todas las vistas |
| `/control` | Panel de control | Buscar himnos, navegar versos, ajustar configuración |
| `/display` | Overlay para OBS | Browser Source transparente, texto superpuesto |
| `/projection` | Pantalla de proyección | Vista independiente con fondos visuales degradados |

---

## ✨ Características Principales

### 🎵 Datos
- Más de 480 himnos en YAML organizados en múltiples himnarios
- Detección automática de **Coro** y **Último Coro** con visual diferenciada
- Búsqueda por número o título con filtro en tiempo real (atajo `Enter`)

### 🖥️ Panel de Control (`/control`)
- **5 pestañas** accesibles por teclado (`Ctrl+1` … `Ctrl+5`):
  - **Buscar** — filtro en tiempo real, navegación con teclado
  - **Himno** — vista de versos, atajo `.` para proyectar el verso activo
  - **Guardados** — guardar y recuperar himnos frecuentes
  - **Plantillas** — plantillas prediseñadas para display y proyección, guardar configuración personalizada
  - **Ajustes** — configuración de display, proyección y UI
- Scrollbar elegante y minimalista (3 px, tinte dorado, aparece al hover)

### 📺 Display OBS (`/display`)
- Fondo 100% transparente por defecto (ideal como Browser Source)
- Layout ancho completo, texto alineado a la izquierda/centro/derecha
- Animación `fadeInUp` suave al cambiar verso
- Escala de fuente dinámica para que el texto nunca se corte
- Panel de texto opcional con fondo semi-transparente y blur
- Indicador visual **"— Coro —"** / **"— Último Coro —"**

### 🎬 Proyección (`/projection`)
- Vista independiente con **19 fondos de degradado CSS** en 5 categorías: Naturaleza, Cielo, Luz, Apacible, Espiritual
- Fondo cambia automáticamente al proyectar un nuevo himno (configurable)
- Contenido centrado con `maxWidth` controlable
- Indicador visual de coro/último coro igual que el display
- Configuración completamente independiente del display

### 🎨 Plantillas
**Display (9 plantillas):**
- Minimalista — Solo texto / Texto con panel / Verso centrado
- Alto Contraste — Contraste máximo / Coro destacado
- Elegante — Clásico con serif / Moderno sin serif
- Con Marca — Alineado izquierda / Con identificación

**Proyección (8 plantillas):**
- Clásico — Adoración Clásica / Proclamación
- Espiritual — Celestial / Momentos Íntimos / Noche de Adoración
- Luminoso — Gloria / Luz y Verdad
- Moderno — Moderno Limpio

Además: **guardar la configuración actual como plantilla personalizada**, almacenada en localStorage.

---

## ⌨️ Atajos de Teclado (Panel de Control)

| Atajo | Acción |
|---|---|
| `Ctrl+1` | Pestaña Buscar |
| `Ctrl+2` | Pestaña Himno |
| `Ctrl+3` | Pestaña Guardados |
| `Ctrl+4` | Pestaña Plantillas |
| `Ctrl+5` | Pestaña Ajustes |
| `Enter` | Ejecutar búsqueda |
| `↑ / ↓` | Navegar versos del himno activo |
| `.` (punto) | Proyectar verso activo al display |

---

## 🚀 Inicio Rápido

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Backend (Opcional)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

API en `http://localhost:8000`. El frontend funciona completamente sin backend usando `BroadcastChannel` y `localStorage`.

---

## 📋 Configuración en OBS Studio

### Agregar el Panel de Control como Dock
1. OBS → `View` → `Docks` → `Custom Browser Docks`
2. Nombre: `Himnos`, URL: `http://localhost:5173/control`

### Agregar el Display como Browser Source
1. Agrega fuente `Browser Source` en tu escena
2. URL: `http://localhost:5173/display`
3. Ancho: `1920`, Alto: `1080` (o tu resolución de escena)
4. Desactiva **"Shutdown source when not visible"**

### Vista de Proyección (pantalla separada)
1. Abre `http://localhost:5173/projection` en un navegador aparte
2. Mueve esa ventana a la pantalla del proyector
3. Pon el navegador en pantalla completa (`F11`)

---

## 🌐 URLs en GitHub Pages

Si desplegás con GitHub Pages (proyecto `Plugin-Himnos`):

| Vista | URL |
|---|---|
| Inicio | `https://sjwaves.github.io/Plugin-Himnos/` |
| Panel | `https://sjwaves.github.io/Plugin-Himnos/control` |
| Display OBS | `https://sjwaves.github.io/Plugin-Himnos/display` |
| Proyección | `https://sjwaves.github.io/Plugin-Himnos/projection` |

---

## 🛠️ Tecnologías

| Capa | Stack |
|---|---|
| Frontend | React 18 + TypeScript, Vite 6, Tailwind CSS |
| Estilos | Glassmorphism personalizado, variables CSS |
| Comunicación | `BroadcastChannel` API, `localStorage` |
| Datos | YAML + parser propio, sin base de datos |
| Backend (opcional) | Python 3.11+, FastAPI, Pydantic, WebSockets |

---

## 📁 Estructura del Proyecto

```
HIMNOS_OBS/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── control/page.tsx               # Panel de control (5 pestañas)
│       │   ├── display/page.tsx               # Overlay OBS transparente
│       │   ├── projection/page.tsx            # Vista proyector con degradados
│       │   ├── home/page.tsx                  # Página de inicio
│       │   ├── data/
│       │   │   ├── hymns.yaml                 # +480 himnos en YAML
│       │   │   └── hymns.ts                   # Parser + detección de Coro
│       │   └── utils/broadcast.ts             # Tipos, BroadcastChannel, storage
│       ├── shared/
│       │   ├── constants/
│       │   │   ├── templates.ts               # Plantillas display + proyección
│       │   │   └── projection-backgrounds.ts  # 19 degradados CSS
│       │   └── utils/text.ts                  # Normalización + limpieza @CORO@
│       ├── services/hymns.ts                  # Servicio de carga de himnos
│       └── styles/
│           ├── glass.css                      # Glassmorphism + ctrl-scroll
│           └── theme.css                      # Variables CSS / accent color
├── backend/                                   # API Python opcional (FastAPI)
├── docs/
│   ├── GUIDE.md                               # Guía detallada del sistema
│   └── himnos-estructura-incorrecta.txt       # Registro de himnos corregidos
├── ARCHITECTURE.md
└── README.md
```

---

## 📖 Documentación

- [Guía Detallada del Sistema](./docs/GUIDE.md)
- [Arquitectura del Proyecto](./ARCHITECTURE.md)
- [Guías de Desarrollo](./guidelines/Guidelines.md)
- [Registro de Himnos Corregidos](./docs/himnos-estructura-incorrecta.txt)
