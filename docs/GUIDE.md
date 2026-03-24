# Guía Detallada — Himnos OBS

Documentación técnica y de uso del sistema de himnos para OBS Studio.

---

## Índice

1. [Comunicación entre vistas](#1-comunicación-entre-vistas)
2. [Panel de Control — pestañas y atajos](#2-panel-de-control--pestañas-y-atajos)
3. [Display OBS — configuración visual](#3-display-obs--configuración-visual)
4. [Vista de Proyección](#4-vista-de-proyección)
5. [Plantillas](#5-plantillas)
6. [Sistema de Coro / Último Coro](#6-sistema-de-coro--último-coro)
7. [Estructura del YAML de himnos](#7-estructura-del-yaml-de-himnos)
8. [localStorage — claves utilizadas](#8-localstorage--claves-utilizadas)
9. [Estilos y diseño](#9-estilos-y-diseño)
10. [Fondos de Proyección — categorías y lista](#10-fondos-de-proyección--categorías-y-lista)

---

## 1. Comunicación entre vistas

Las vistas **no usan un servidor** para sincronizarse. Se comunican mediante la `BroadcastChannel` API del navegador (canal `obs-hymn-display`). Esto significa que todas las vistas deben estar abiertas **en el mismo navegador y mismo origen**.

```
Panel de Control  ──broadcast──►  Display OBS
                  ──broadcast──►  Proyección
```

Los mensajes tienen un campo `type`:

| `type` | Payload | Descripción |
|---|---|---|
| `display` | `HymnDisplay` | Proyectar un verso |
| `config` | `DisplayConfig` | Actualizar configuración del display |
| `projectionConfig` | `ProjectionConfig` | Actualizar configuración de proyección |
| `clear` | — | Ocultar el verso activo |

Cuando no hay `BroadcastChannel` disponible (o en otro tab/navegador), hay un fallback a `localStorage` + evento `storage`.

---

## 2. Panel de Control — pestañas y atajos

### Pestaña 1 — Buscar (`Ctrl+1`)

- Campo de texto para filtrar por número o título
- Presionar `Enter` ejecuta la búsqueda inmediatamente
- Usar `↑ / ↓` para moverse por la lista de resultados
- Clic o `Enter` sobre un himno lo abre en la pestaña Himno

### Pestaña 2 — Himno (`Ctrl+2`)

- Lista de todos los versos del himno seleccionado
- Los versos de **Coro** y **Último Coro** tienen indicador visual distintivo
- Clic en un verso lo envía al display y proyección
- Atajo `.` (punto) mientras la pestaña está activa: proyecta el verso resaltado
- Flechas `↑ / ↓` navegan el verso activo

### Pestaña 3 — Guardados (`Ctrl+3`)

- Guarda himnos frequent usados
- Persisten en `localStorage` bajo la clave `obs-saved-hymns`
- Clic en un himno guardado lo carga directamente

### Pestaña 4 — Plantillas (`Ctrl+4`)

Ver sección [5. Plantillas](#5-plantillas).

### Pestaña 5 — Ajustes (`Ctrl+5`)

Dividida en dos secciones principales:

**Ajustes de Display:**
- Fuente, tamaño, color del texto
- Color y tamaño del título
- Panel de fondo (color, opacidad, blur, borde)
- Posición vertical (top / middle / bottom) y offsets
- Sombra de texto, animación
- Alineación horizontal del contenedor
- Fondo de página (color + opacidad, normalmente 0)

**Ajustes de Proyección:**
- Habilitar / deshabilitar vista de proyección
- Fondos visuales (categoría, modo: random/cycle/fixed)
- Cambio de fondo al cambiar himno
- Opacidad del overlay oscuro sobre el fondo
- Fuente, tamaño, color, sombra
- Panel glassmorphism (fondo, opacidad, blur)
- Posición vertical y `maxWidth` del contenido

---

## 3. Display OBS — configuración visual

### Configuración por defecto (`DEFAULT_CONFIG`)

| Propiedad | Valor | Descripción |
|---|---|---|
| `fontSize` | `46` | Tamaño base del texto (px) |
| `fontFamily` | `Georgia, serif` | Fuente tipográfica |
| `textColor` | `#FFFFFF` | Color del texto |
| `textShadow` | `true` | Sombra en el texto |
| `textAlign` | `center` | Alineación del texto |
| `showTitle` | `true` | Mostrar número y título del himno |
| `titleFontSize` | `24` | Tamaño del título (px) |
| `titleColor` | `#F5C842` | Color del título (dorado) |
| `showPanel` | `false` | Panel de fondo detrás del texto |
| `panelBackground` | `#000000` | Color del panel |
| `panelOpacity` | `0.5` | Opacidad del panel (0–1) |
| `panelBlur` | `12` | Blur del panel (px) |
| `position` | `bottom` | Posición vertical: top/middle/bottom |
| `marginBottom` | `50` | Margen inferior (px) |
| `horizontalAlignment` | `center` | Alineación del contenedor |
| `pageBackgroundOpacity` | `0` | Opacidad fondo página (0 = transparente) |
| `maxWidth` | `9999` | Ancho máximo (9999 = ancho completo) |

### Comportamiento de fuente dinámica

El display calcula automáticamente un `scaledFontSize` usando un `useLayoutEffect`: si el texto es más largo de lo que cabe, reduce el tamaño de fuente iterativamente hasta que cabe en el contenedor. El tamaño mínimo es `config.fontSize * 0.4`.

---

## 4. Vista de Proyección

### Configuración por defecto (`DEFAULT_PROJECTION_CONFIG`)

| Propiedad | Valor | Descripción |
|---|---|---|
| `fontSize` | `52` | Tamaño de texto (px) — fijo, sin escala dinámica |
| `fontFamily` | `Georgia, serif` | Fuente |
| `textColor` | `#FFFFFF` | Color texto |
| `textAlign` | `center` | Alineación (siempre centrado) |
| `textShadow` | `true` | Sombra |
| `showTitle` | `true` | Mostrar título del himno |
| `titleFontSize` | `28` | Tamaño título |
| `titleColor` | `#F5C842` | Color título |
| `showPanel` | `true` | Panel glassmorphism |
| `panelOpacity` | `0.45` | Opacidad panel |
| `panelBlur` | `16` | Blur panel (px) |
| `position` | `bottom` | Posición vertical |
| `maxWidth` | `960` | Ancho máximo del contenido (px) |
| `padding` | `32` | Padding interno (px) |
| `marginBottom` | `60` | Margen inferior (px) |
| `showBackground` | `true` | Mostrar fondo degradado |
| `backgroundCategory` | `spiritual` | Categoría de fondo |
| `backgroundMode` | `random` | Modo: random / cycle / fixed |
| `backgroundChangeOnHymn` | `true` | Cambiar fondo al cambiar himno |
| `backgroundOverlayOpacity` | `0.35` | Oscurecer fondo para legibilidad |

### Diferencia clave con el Display

- El display usa escala de fuente **dinámica** (se reduce si el texto no cabe)
- La proyección usa `config.fontSize` **fijo** (diseñado para pantalla física donde el texto puede fluir)

---

## 5. Plantillas

Las plantillas están en `frontend/src/shared/constants/templates.ts`.

### Plantillas de Display (`DISPLAY_TEMPLATES`)

Cada plantilla implementa `DisplayTemplate`:

```ts
interface DisplayTemplate {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'contrast' | 'elegant' | 'branded' | 'custom';
  preview: { backgroundColor: string; textColor: string; accentColor: string; };
  config: Partial<DisplayConfig>;
}
```

**Reglas de diseño para display:**
- `pageBackgroundOpacity` siempre `0` (fondo transparente)
- `maxWidth` siempre `9999` (ancho completo)
- No usan fondos de color de página

### Plantillas de Proyección (`PROJECTION_TEMPLATES`)

Cada plantilla implementa `ProjectionTemplate`:

```ts
interface ProjectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'clasico' | 'moderno' | 'espiritual' | 'luminoso';
  preview: { gradient: string; textColor: string; accentColor: string; };
  config: Partial<ProjectionConfig>;
}
```

**Reglas de diseño para proyección:**
- `textAlign` siempre `center`
- `showBackground` siempre `true`
- `maxWidth` acotado (700–1100 px)

### Plantillas Personalizadas

El usuario puede guardar la configuración actual como plantilla personalizada desde la pestaña Plantillas. Se almacenan en `localStorage['obs-custom-templates']` con `category: 'custom'`.

---

## 6. Sistema de Coro / Último Coro

### Marcación en YAML

Cuando un verso comienza con `CORO` o `ULTIMO CORO`, el parser le agrega un marcador especial:

```
CORO
  Texto del coro...
  Segunda línea...
```

Se convierte internamente en:

```
@CORO@CORO
Texto del coro...
Segunda línea...
```

### Detección (regex utilizada)

```ts
/^[\d.\s(*]*(?:[ÚU]LTIMO\s+)?CORO/i
```

Esto captura todas las variantes encontradas en el himnario:
- `CORO`
- `ULTIMO CORO`
- `. ULTIMO CORO`
- `3. (Ultimo coro)`

### Renderizado en Display y Proyección

```ts
const isCoro = rawText.includes('@CORO@');
const coroHeader = isCoro ? rawText.match(/@CORO@([^\n]*)/)?.[1]?.trim() ?? '' : '';
const displayTitle = isCoro
  ? (/ULTIMO/i.test(coroHeader) ? 'Último Coro' : 'Coro')
  : null;
const cleanVerseText = isCoro
  ? rawText.replace(/@CORO@[^\n]*\n?/, '').trim()
  : rawText;
```

El `displayTitle` se muestra como `— Coro —` o `— Último Coro —` en itálica sobre el texto del verso.

---

## 7. Estructura del YAML de himnos

```yaml
# Formato multi-himnario
HimnarioNombre:
  name: "Nombre del Himnario"
  hymns:
    - number: 1
      title: "Título del Himno"
      verses:
        - |-
          1. Primera estrofa
             Segunda línea de la estrofa
        - |-
          CORO
            Texto del coro
            Segunda línea del coro
        - |-
          2. Segunda estrofa
        - |-
          ULTIMO CORO
            Texto del último coro
```

**Notas importantes:**
- Los versos usan el bloque literal `|-` de YAML (preserva saltos de línea, elimina el salto final)
- La indentación dentro del verso es parte del contenido y se preserva
- El parser detecta `CORO` / `ULTIMO CORO` en la primera línea del verso
- Ver `docs/himnos-estructura-incorrecta.txt` para la lista de himnos que tenían estructura incorrecta y fueron corregidos

---

## 8. localStorage — claves utilizadas

| Clave | Tipo | Contenido |
|---|---|---|
| `obs-hymn-config` | `DisplayConfig` | Configuración visual del display |
| `obs-projection-config` | `ProjectionConfig` | Configuración de la vista de proyección |
| `obs-custom-templates` | `DisplayTemplate[]` | Plantillas guardadas por el usuario |
| `obs-saved-hymns` | `SavedHymn[]` | Himnos guardados en la pestaña Guardados |
| `obs-ui-settings` | `UISettings` | Preferencias del panel de control (escala, header, etc.) |

---

## 9. Estilos y diseño

### Sistema de estilos

- `styles/theme.css` — variables CSS raíz: `--accent` (#C5A021 dorado), `--accent-rgb`, colores de fondo, radio, etc.
- `styles/glass.css` — clases de glassmorphism: `.glass-panel`, `.glass-subtle`, `.glass-scroll`, `.ctrl-scroll`
- `styles/tailwind.css` — directivas Tailwind
- `styles/fonts.css` — importación de fuentes

### Clase `.ctrl-scroll`

Scrollbar elegante y minimalista para el panel de control:

```css
.ctrl-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--accent-rgb), 0.22) transparent;
}
.ctrl-scroll::-webkit-scrollbar { width: 3px; }
.ctrl-scroll::-webkit-scrollbar-track { background: transparent; }
.ctrl-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--accent-rgb), 0.22);
  border-radius: 99px;
}
.ctrl-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--accent-rgb), 0.5);
}
```

### Color de acento

El color dorado `#C5A021` (RGB `197, 160, 33`) se usa en: bordes, títulos, plantillas, scrollbar, indicadores activos. Se cambia modificando `--accent` en `theme.css`.

---

## 10. Fondos de Proyección — categorías y lista

Los 19 degradados están en `frontend/src/shared/constants/projection-backgrounds.ts`.

| Categoría | ID | Nombre |
|---|---|---|
| `nature` | `nature-forest` | Bosque Profundo |
| `nature` | `nature-earth` | Tierra Fértil |
| `nature` | `nature-ocean` | Océano Profundo |
| `nature` | `nature-mountain` | Montaña al Amanecer |
| `sky` | `sky-dawn` | Alba Dorada |
| `sky` | `sky-twilight` | Crepúsculo |
| `sky` | `sky-night` | Noche Estrellada |
| `sky` | `sky-storm` | Cielo Tormentoso |
| `light` | `light-warm` | Luz Cálida |
| `light` | `light-cool` | Luz Fría |
| `light` | `light-golden` | Luz Dorada |
| `peaceful` | `peaceful-lavender` | Lavanda |
| `peaceful` | `peaceful-sage` | Salvia |
| `peaceful` | `peaceful-rose` | Rosa Suave |
| `peaceful` | `peaceful-mist` | Niebla de Mañana |
| `spiritual` | `spiritual-purple` | Púrpura Profundo |
| `spiritual` | `spiritual-blue` | Azul Celestial |
| `spiritual` | `spiritual-gold` | Reverencia Dorada |
| `spiritual` | `spiritual-dark` | Oscuridad Sagrada |

Los modos de selección son:
- **`random`** — elige uno al azar al iniciar / al cambiar himno
- **`cycle`** — avanza en orden dentro de la categoría seleccionada
- **`fixed`** — usa siempre el índice `backgroundIndex`
