# Hymns OBS Backend

API Backend para el sistema de himnos OBS.

## Requisitos

- Python 3.11+

## Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt
```

## Configuración

Copiar `.env.example` a `.env` y ajustar valores:

```bash
cp .env.example .env
```

## Ejecución

### Desarrollo

```bash
python run.py
```

O con uvicorn directamente:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Producción

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Estructura

```
backend/
├── app/
│   ├── api/           # Endpoints REST
│   ├── core/          # Configuración central
│   ├── models/        # Modelos Pydantic
│   ├── services/      # Lógica de negocio
│   ├── utils/         # Utilidades
│   └── main.py        # Entrada de la app
├── tests/             # Tests unitarios
├── requirements.txt   # Dependencias
└── run.py            # Script de desarrollo
```

## Tests

```bash
pytest
```
