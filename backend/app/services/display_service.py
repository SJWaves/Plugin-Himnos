"""
Display Service
===============
Business logic for display state management.
"""

from typing import Optional, List, Callable
import asyncio

from app.models.display import DisplayConfig, HymnDisplay, DisplayState


class DisplayService:
    """Service for managing display state and broadcasting."""
    
    _current_display: Optional[HymnDisplay] = None
    _config: DisplayConfig = DisplayConfig()
    _listeners: List[Callable] = []
    
    @classmethod
    def get_current_display(cls) -> Optional[HymnDisplay]:
        """Get the current display state."""
        return cls._current_display
    
    @classmethod
    def get_config(cls) -> DisplayConfig:
        """Get the current display configuration."""
        return cls._config
    
    @classmethod
    def get_state(cls) -> DisplayState:
        """Get the overall display state."""
        return DisplayState(
            is_active=cls._current_display is not None,
            current_display=cls._current_display
        )
    
    @classmethod
    async def set_display(cls, display: Optional[HymnDisplay]) -> None:
        """Set the current display and notify listeners."""
        cls._current_display = display
        await cls._notify_listeners("display", display)
    
    @classmethod
    async def clear_display(cls) -> None:
        """Clear the current display."""
        await cls.set_display(None)
    
    @classmethod
    async def update_config(cls, config: DisplayConfig) -> DisplayConfig:
        """Update display configuration."""
        cls._config = config
        await cls._notify_listeners("config", config)
        return cls._config
    
    @classmethod
    async def partial_update_config(cls, updates: dict) -> DisplayConfig:
        """Partially update display configuration."""
        current_dict = cls._config.model_dump()
        current_dict.update(updates)
        cls._config = DisplayConfig(**current_dict)
        await cls._notify_listeners("config", cls._config)
        return cls._config
    
    @classmethod
    def add_listener(cls, callback: Callable) -> None:
        """Add a listener for display updates."""
        cls._listeners.append(callback)
    
    @classmethod
    def remove_listener(cls, callback: Callable) -> None:
        """Remove a listener."""
        if callback in cls._listeners:
            cls._listeners.remove(callback)
    
    @classmethod
    async def _notify_listeners(cls, event_type: str, data) -> None:
        """Notify all listeners of an update."""
        for listener in cls._listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(event_type, data)
                else:
                    listener(event_type, data)
            except Exception as e:
                print(f"[DisplayService] Error notifying listener: {e}")


# Initialize service instance
display_service = DisplayService()
