"""
WebSocket API Endpoints
=======================
Real-time communication endpoints for OBS integration.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from app.services.websocket_service import connection_manager
from app.services.display_service import DisplayService


router = APIRouter()


@router.websocket("/display")
async def websocket_display(websocket: WebSocket):
    """
    WebSocket endpoint for real-time display updates.
    
    Clients (OBS browser sources) connect here to receive display updates.
    
    Messages sent to client:
    - {"type": "display", "data": {...}} - Display update
    - {"type": "config", "data": {...}} - Configuration update
    - {"type": "connected", "data": {...}} - Initial state on connect
    
    Messages received from client:
    - {"type": "ping"} - Keep-alive ping
    - {"type": "get_state"} - Request current state
    """
    await connection_manager.connect(websocket)
    
    try:
        # Send initial state on connect
        current_display = DisplayService.get_current_display()
        current_config = DisplayService.get_config()
        
        await connection_manager.send_personal_message(websocket, {
            "type": "connected",
            "data": {
                "display": current_display.model_dump(by_alias=True) if current_display else None,
                "config": current_config.model_dump()
            }
        })
        
        # Listen for messages from client
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await connection_manager.send_personal_message(websocket, {
                        "type": "pong",
                        "data": None
                    })
                
                elif message.get("type") == "get_state":
                    current_display = DisplayService.get_current_display()
                    current_config = DisplayService.get_config()
                    await connection_manager.send_personal_message(websocket, {
                        "type": "state",
                        "data": {
                            "display": current_display.model_dump(by_alias=True) if current_display else None,
                            "config": current_config.model_dump()
                        }
                    })
                    
            except json.JSONDecodeError:
                await connection_manager.send_personal_message(websocket, {
                    "type": "error",
                    "data": {"message": "Invalid JSON"}
                })
                
    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)


@router.websocket("/control")
async def websocket_control(websocket: WebSocket):
    """
    WebSocket endpoint for control panel.
    
    Allows the control panel to send commands and receive state updates.
    
    Messages received from client:
    - {"type": "show", "data": {...}} - Show verse
    - {"type": "clear"} - Clear display
    - {"type": "config", "data": {...}} - Update config
    """
    await connection_manager.connect(websocket)
    
    try:
        # Send initial state on connect
        current_display = DisplayService.get_current_display()
        current_config = DisplayService.get_config()
        
        await connection_manager.send_personal_message(websocket, {
            "type": "connected",
            "data": {
                "display": current_display.model_dump(by_alias=True) if current_display else None,
                "config": current_config.model_dump()
            }
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            msg_data = message.get("data")
            
            if msg_type == "show" and msg_data:
                from app.models.display import HymnDisplay
                display = HymnDisplay(**msg_data)
                await DisplayService.set_display(display)
                await connection_manager.broadcast_display(display)
                
            elif msg_type == "clear":
                await DisplayService.clear_display()
                await connection_manager.broadcast_display(None)
                
            elif msg_type == "config" and msg_data:
                from app.models.display import DisplayConfig
                config = DisplayConfig(**msg_data)
                await DisplayService.update_config(config)
                await connection_manager.broadcast_config(config)
                
            elif msg_type == "ping":
                await connection_manager.send_personal_message(websocket, {
                    "type": "pong"
                })
                
    except WebSocketDisconnect:
        await connection_manager.disconnect(websocket)
    except json.JSONDecodeError:
        await connection_manager.send_personal_message(websocket, {
            "type": "error",
            "data": {"message": "Invalid JSON"}
        })
