
# Plugin de Himnos para OBS Studio

Un plugin moderno y elegante para mostrar letras de himnos durante transmisiones en vivo con OBS Studio. Diseñado con una interfaz glassmorphism premium y controles intuitivos.

## ✨ Características

- 🎵 **Múltiples Himnarios**: Soporte para diferentes libros de himnos
- 🎨 **Interfaz Glassmorphism**: Diseño moderno con efectos visuales elegantes
- 📱 **Responsive**: Funciona perfectamente en diferentes resoluciones
- ⚙️ **Configurable**: Personaliza colores, fuentes, posiciones y más
- 🔄 **Tiempo Real**: Sincronización instantánea entre panel de control y display
- 🎯 **Fácil Integración**: Compatible con Browser Source de OBS

## 🚀 Instalación y Uso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/SJWaves/Plugin-Himnos.git
cd Plugin-Himnos
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Desarrollar
```bash
npm run dev
```

### 4. Construir para Producción
```bash
npm run build
```

## 📋 Configuración en OBS Studio

### Panel de Control
1. Abre OBS Studio
2. Ve a `View` → `Docks` → `Custom Browser Docks`
3. URL: `http://localhost:5173/control` (o tu URL de producción)

### Vista de Display
1. Agrega una nueva fuente: `Browser Source`
2. URL: `http://localhost:5173/display` (o tu URL de producción)
3. Configura el ancho y alto según tu escena

## 🎛️ Funcionalidades

### Panel de Control
- 🔍 **Búsqueda**: Busca himnos por número o título
- 📖 **Navegación**: Usa flechas ↑↓ para cambiar párrafos
- ⚙️ **Configuración**: Personaliza apariencia y comportamiento

### Vista de Display
- 📺 **Pantalla en Vivo**: Muestra himnos con efectos visuales
- 🎨 **Personalizable**: Colores, fuentes, posiciones
- 📐 **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **Comunicación**: BroadcastChannel API
- **Build**: Vite

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/     # Componentes reutilizables
│   ├── control/        # Panel de control
│   ├── display/        # Vista de display
│   ├── home/          # Página de inicio
│   ├── routes.ts      # Configuración de rutas
│   └── utils/         # Utilidades (broadcast, etc.)
├── styles/            # Estilos CSS
└── main.tsx          # Punto de entrada
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

Desarrollado para facilitar la presentación de himnos en transmisiones en vivo.

---

**URL del Panel**: http://localhost:5173/control
**URL del Display**: http://localhost:5173/display
  