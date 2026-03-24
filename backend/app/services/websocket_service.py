"""
WebSocket Service
=================
Real-time communication service using WebSockets.
"""

from typing import List, Set
import asyncio
import json

from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
        print(f"[WebSocket] Client connected. Total: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        async with self._lock:
            self.active_connections.discard(websocket)
        print(f"[WebSocket] Client disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict) -> None:
        """Broadcast a message to all connected clients."""
        if not self.active_connections:
            return
        
        message_str = json.dumps(message)
        disconnected = set()
        
        async with self._lock:
            for connection in self.active_connections:
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    print(f"[WebSocket] Error sending message: {e}")
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            self.active_connections -= disconnected
    
    async def send_personal_message(self, websocket: WebSocket, message: dict) -> None:
        """Send a message to a specific client."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"[WebSocket] Error sending personal message: {e}")
    
    async def broadcast_display(self, display_data) -> None:
        """Broadcast display update to all clients."""
        await self.broadcast({
            "type": "display",
            "data": display_data.model_dump(by_alias=True) if display_data else None
        })
    
    async def broadcast_config(self, config_data) -> None:
        """Broadcast config update to all clients."""
        await self.broadcast({
            "type": "config",
            "data": config_data.model_dump() if hasattr(config_data, 'model_dump') else config_data
        })


# Global connection manager instance
connection_manager = ConnectionManager()
