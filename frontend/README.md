# Hymns OBS Frontend

Aplicación React para control y visualización de himnos.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173

## Build

```bash
npm run build
```

Los archivos se generan en `dist/`

## Estructura

```
frontend/
├── src/
│   ├── app/           # Páginas y componentes actuales
│   │   ├── components/
│   │   ├── control/
│   │   ├── display/
│   │   ├── home/
│   │   └── data/
│   ├── features/      # Módulos por característica
│   ├── shared/        # Código compartido
│   │   ├── types/     # Interfaces TypeScript
│   │   ├── hooks/     # Custom hooks
│   │   ├── utils/     # Utilidades
│   │   └── constants/ # Constantes
│   ├── services/      # Servicios de datos
│   └── styles/        # Estilos CSS
├── public/            # Archivos estáticos
└── index.html
```

## Páginas

- `/` - Página de inicio
- `/control` - Panel de control (para OBS Dock)
- `/display` - Vista de display (para OBS Browser Source)

## Configuración

Variables de entorno en `.env`:

```env
VITE_API_URL=http://localhost:8000
```
