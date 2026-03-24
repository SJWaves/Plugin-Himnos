"""
Configuration API Endpoints
===========================
REST API for display configuration management.
"""

from fastapi import APIRouter

from app.models.display import DisplayConfig
from app.services.display_service import DisplayService
from app.services.websocket_service import connection_manager


router = APIRouter()


@router.get("/", response_model=DisplayConfig)
async def get_config():
    """
    Get the current display configuration.
    """
    return DisplayService.get_config()


@router.put("/", response_model=DisplayConfig)
async def update_config(config: DisplayConfig):
    """
    Update the display configuration.
    
    Replaces the entire configuration and broadcasts to all connected clients.
    """
    updated = await DisplayService.update_config(config)
    await connection_manager.broadcast_config(updated)
    return updated


@router.patch("/", response_model=DisplayConfig)
async def partial_update_config(updates: dict):
    """
    Partially update the display configuration.
    
    Only updates the fields provided in the request body.
    """
    updated = await DisplayService.partial_update_config(updates)
    await connection_manager.broadcast_config(updated)
    return updated


@router.post("/reset", response_model=DisplayConfig)
async def reset_config():
    """
    Reset configuration to default values.
    """
    default_config = DisplayConfig()
    updated = await DisplayService.update_config(default_config)
    await connection_manager.broadcast_config(updated)
    return updated
