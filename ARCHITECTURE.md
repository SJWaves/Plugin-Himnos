# Hymns OBS - Reorganized Project Structure

This document describes the new modular architecture for the Hymns OBS project.

## Project Overview

The project has been reorganized into a clear separation between:
- **Frontend**: React application for the control panel and OBS display
- **Backend**: Python (FastAPI) API server for data management and real-time communication

## Directory Structure

```
HIMNOS_OBS/
├── backend/                    # Python Backend (FastAPI)
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   │   ├── hymns.py       # Hymn operations
│   │   │   ├── display.py     # Display state management
│   │   │   ├── config.py      # Configuration endpoints
│   │   │   └── websocket.py   # WebSocket handlers
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py      # Application settings
│   │   │   └── database.py    # Database setup
│   │   ├── models/            # Pydantic models
│   │   │   ├── hymn.py        # Hymn data models
│   │   │   └── display.py     # Display config models
│   │   ├── services/          # Business logic
│   │   │   ├── hymn_service.py
│   │   │   ├── display_service.py
│   │   │   └── websocket_service.py
│   │   ├── utils/             # Utility functions
│   │   └── main.py            # FastAPI app entry point
│   ├── tests/                 # Unit tests
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Development server script
│
├── frontend/                   # React Frontend (Vite)
│   ├── src/
│   │   ├── app/               # Application pages (existing)
│   │   │   ├── components/    # Reusable components
│   │   │   ├── control/       # Control panel page
│   │   │   ├── display/       # OBS display page
│   │   │   ├── home/          # Home page
│   │   │   └── data/          # Hymn data (YAML)
│   │   ├── features/          # Feature modules (new)
│   │   │   ├── hymns/
│   │   │   ├── display/
│   │   │   ├── control/
│   │   │   ├── settings/
│   │   │   └── home/
│   │   ├── shared/            # Shared code (new)
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── utils/         # Utility functions
│   │   │   └── constants/     # App constants
│   │   ├── services/          # API and data services (new)
│   │   │   ├── api.ts         # Backend API client
│   │   │   ├── broadcast.ts   # BroadcastChannel service
│   │   │   ├── hymns.ts       # Hymn data service
│   │   │   └── websocket.ts   # WebSocket client
│   │   └── styles/            # CSS styles
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                       # Documentation
└── guidelines/                 # Development guidelines
```

## Backend (Python)

### Technology Stack
- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: Database ORM (optional, for future persistence)
- **WebSockets**: Real-time communication with frontend

### Running the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python run.py
# or: uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### API Endpoints

#### Hymns
- `GET /api/hymns/` - List all hymnbooks
- `GET /api/hymns/{hymnbook_id}` - Get hymnbook with hymns
- `GET /api/hymns/{hymnbook_id}/search?q=query` - Search hymns
- `GET /api/hymns/{hymnbook_id}/hymn/{number}` - Get specific hymn

#### Display
- `GET /api/display/state` - Get current display state
- `POST /api/display/show` - Show a verse
- `POST /api/display/clear` - Clear display
- `POST /api/display/next` - Show next verse
- `POST /api/display/previous` - Show previous verse

#### Configuration
- `GET /api/config/` - Get display configuration
- `PUT /api/config/` - Update configuration
- `PATCH /api/config/` - Partial update
- `POST /api/config/reset` - Reset to defaults

#### WebSocket
- `ws://localhost:8000/ws/display` - Display updates (for OBS)
- `ws://localhost:8000/ws/control` - Control commands

## Frontend (React)

### Technology Stack
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS
- **Radix UI**: Accessible component primitives

### Running the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Architecture

#### Shared Layer (`/src/shared/`)
Contains reusable code across the application:
- **types/**: TypeScript interfaces and type definitions
- **hooks/**: Custom React hooks for state management
- **utils/**: Utility functions (color, text, storage)
- **constants/**: Application constants and configuration

#### Services Layer (`/src/services/`)
Handles data access and communication:
- **hymns.ts**: Local hymn data management (from YAML)
- **api.ts**: HTTP client for backend API
- **broadcast.ts**: BroadcastChannel for tab communication
- **websocket.ts**: WebSocket client for real-time updates

#### Features Layer (`/src/features/`)
Feature-specific components and logic (to be migrated from `/src/app/`)

## Communication Modes

The frontend supports two communication modes:

### 1. Local Mode (BroadcastChannel)
- No backend required
- Uses BroadcastChannel API for tab-to-tab communication
- Hymn data loaded from local YAML file
- Ideal for single-machine setups

### 2. Server Mode (WebSocket)
- Requires backend server
- Real-time synchronization via WebSocket
- Centralized state management
- Supports multiple devices/machines

## Environment Variables

### Backend (.env)
```env
APP_NAME=Hymns OBS API
DEBUG=false
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite+aiosqlite:///./hymns.db
CORS_ORIGINS=["http://localhost:5173"]
HYMNS_YAML_PATH=../frontend/src/app/data/hymns.yaml
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Development Workflow

1. Start the backend server (optional for local mode)
2. Start the frontend dev server
3. Open Control Panel at `http://localhost:5173/control`
4. Open Display in OBS Browser Source at `http://localhost:5173/display`

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Future Improvements

1. **Database Persistence**: Store saved hymns and settings in SQLite
2. **User Authentication**: Multi-user support with accounts
3. **Multiple Languages**: i18n support for interface
4. **Themes**: Customizable visual themes
5. **Docker**: Containerized deployment
6. **CI/CD**: Automated testing and deployment
