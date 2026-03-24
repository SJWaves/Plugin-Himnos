"""
Main FastAPI Application
========================
Entry point for the Hymns OBS backend API.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import hymns, display, config, websocket
from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Hymns OBS API",
    description="Backend API for managing hymn displays in OBS Studio",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hymns.router, prefix="/api/hymns", tags=["Hymns"])
app.include_router(display.router, prefix="/api/display", tags=["Display"])
app.include_router(config.router, prefix="/api/config", tags=["Configuration"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "ok",
        "message": "Hymns OBS API is running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
