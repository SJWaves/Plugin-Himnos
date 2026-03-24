"""
Display API Endpoints
=====================
REST API for display state management.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException

from app.models.display import DisplayConfig, HymnDisplay, DisplayState
from app.models.hymn import Hymn
from app.services.display_service import DisplayService
from app.services.hymn_service import HymnService
from app.services.websocket_service import connection_manager


router = APIRouter()


@router.get("/state", response_model=DisplayState)
async def get_display_state():
    """
    Get the current display state.
    
    Returns whether display is active and the current display content.
    """
    return DisplayService.get_state()


@router.get("/current", response_model=Optional[HymnDisplay])
async def get_current_display():
    """
    Get the currently displayed hymn verse.
    
    Returns null if nothing is being displayed.
    """
    return DisplayService.get_current_display()


@router.post("/show")
async def show_verse(display: HymnDisplay):
    """
    Show a specific verse on the display.
    
    Broadcasts the display update to all connected OBS browser sources.
    """
    await DisplayService.set_display(display)
    await connection_manager.broadcast_display(display)
    return {"status": "ok", "message": "Display updated"}


@router.post("/show/{hymnbook_id}/{hymn_number}/{verse_index}")
async def show_verse_by_params(
    hymnbook_id: str,
    hymn_number: int,
    verse_index: int
):
    """
    Show a specific verse using URL parameters.
    
    - **hymnbook_id**: The hymnbook ID
    - **hymn_number**: The hymn number
    - **verse_index**: The verse index (0-based)
    """
    hymn = HymnService.get_hymn(hymnbook_id, hymn_number)
    if not hymn:
        raise HTTPException(
            status_code=404,
            detail=f"Hymn #{hymn_number} not found in hymnbook '{hymnbook_id}'"
        )
    
    if verse_index < 0 or verse_index >= len(hymn.verses):
        raise HTTPException(
            status_code=400,
            detail=f"Verse index {verse_index} out of range (0-{len(hymn.verses)-1})"
        )
    
    display = HymnDisplay(
        hymnbookId=hymnbook_id,
        hymnNumber=hymn.number,
        hymnTitle=hymn.title,
        verseIndex=verse_index,
        verseText=hymn.verses[verse_index],
        config=DisplayService.get_config()
    )
    
    await DisplayService.set_display(display)
    await connection_manager.broadcast_display(display)
    
    return {"status": "ok", "message": "Display updated", "display": display}


@router.post("/next")
async def show_next_verse():
    """
    Show the next verse of the currently displayed hymn.
    """
    current = DisplayService.get_current_display()
    if not current:
        raise HTTPException(status_code=400, detail="No hymn currently displayed")
    
    hymn = HymnService.get_hymn(current.hymnbook_id, current.hymn_number)
    if not hymn:
        raise HTTPException(status_code=404, detail="Current hymn not found")
    
    next_index = current.verse_index + 1
    if next_index >= len(hymn.verses):
        return {"status": "ok", "message": "Already at last verse", "at_end": True}
    
    display = HymnDisplay(
        hymnbookId=current.hymnbook_id,
        hymnNumber=hymn.number,
        hymnTitle=hymn.title,
        verseIndex=next_index,
        verseText=hymn.verses[next_index],
        config=current.config
    )
    
    await DisplayService.set_display(display)
    await connection_manager.broadcast_display(display)
    
    return {"status": "ok", "message": "Moved to next verse", "verse_index": next_index}


@router.post("/previous")
async def show_previous_verse():
    """
    Show the previous verse of the currently displayed hymn.
    """
    current = DisplayService.get_current_display()
    if not current:
        raise HTTPException(status_code=400, detail="No hymn currently displayed")
    
    prev_index = current.verse_index - 1
    if prev_index < 0:
        return {"status": "ok", "message": "Already at first verse", "at_start": True}
    
    hymn = HymnService.get_hymn(current.hymnbook_id, current.hymn_number)
    if not hymn:
        raise HTTPException(status_code=404, detail="Current hymn not found")
    
    display = HymnDisplay(
        hymnbookId=current.hymnbook_id,
        hymnNumber=hymn.number,
        hymnTitle=hymn.title,
        verseIndex=prev_index,
        verseText=hymn.verses[prev_index],
        config=current.config
    )
    
    await DisplayService.set_display(display)
    await connection_manager.broadcast_display(display)
    
    return {"status": "ok", "message": "Moved to previous verse", "verse_index": prev_index}


@router.post("/clear")
async def clear_display():
    """
    Clear the display (hide hymn text).
    
    Broadcasts clear command to all connected OBS browser sources.
    """
    await DisplayService.clear_display()
    await connection_manager.broadcast_display(None)
    return {"status": "ok", "message": "Display cleared"}
