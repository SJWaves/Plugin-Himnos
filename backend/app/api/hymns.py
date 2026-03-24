"""
Hymns API Endpoints
===================
REST API for hymn and hymnbook operations.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.hymn import Hymn, Hymnbook, HymnSearchResult
from app.services.hymn_service import HymnService


router = APIRouter()


@router.get("/", response_model=dict)
async def list_hymnbooks():
    """
    Get all available hymnbooks.
    
    Returns a dictionary with hymnbook IDs as keys and metadata as values.
    """
    hymnbooks = HymnService.get_all_hymnbooks()
    return {
        book_id: {
            "id": book_id,
            "name": book.name,
            "hymn_count": len(book.hymns)
        }
        for book_id, book in hymnbooks.items()
    }


@router.get("/{hymnbook_id}", response_model=Hymnbook)
async def get_hymnbook(hymnbook_id: str):
    """
    Get a specific hymnbook with all its hymns.
    
    - **hymnbook_id**: The unique identifier of the hymnbook
    """
    hymnbook = HymnService.get_hymnbook(hymnbook_id)
    if not hymnbook:
        raise HTTPException(status_code=404, detail=f"Hymnbook '{hymnbook_id}' not found")
    return hymnbook


@router.get("/{hymnbook_id}/search", response_model=HymnSearchResult)
async def search_hymns(
    hymnbook_id: str,
    q: str = Query(default="", description="Search query (number or title)")
):
    """
    Search hymns in a hymnbook.
    
    - **hymnbook_id**: The unique identifier of the hymnbook
    - **q**: Search query (matches hymn number or title)
    """
    hymnbook = HymnService.get_hymnbook(hymnbook_id)
    if not hymnbook:
        raise HTTPException(status_code=404, detail=f"Hymnbook '{hymnbook_id}' not found")
    
    results = HymnService.search_hymns(hymnbook_id, q)
    return HymnSearchResult(hymns=results, total=len(results))


@router.get("/{hymnbook_id}/hymn/{hymn_number}", response_model=Hymn)
async def get_hymn(hymnbook_id: str, hymn_number: int):
    """
    Get a specific hymn by number.
    
    - **hymnbook_id**: The unique identifier of the hymnbook
    - **hymn_number**: The hymn number within the hymnbook
    """
    hymn = HymnService.get_hymn(hymnbook_id, hymn_number)
    if not hymn:
        raise HTTPException(
            status_code=404, 
            detail=f"Hymn #{hymn_number} not found in hymnbook '{hymnbook_id}'"
        )
    return hymn


@router.post("/reload")
async def reload_hymnbooks():
    """
    Reload hymnbooks from the YAML file.
    
    Useful when the YAML file has been updated externally.
    """
    hymnbooks = HymnService.reload_hymnbooks()
    return {
        "status": "ok",
        "message": f"Reloaded {len(hymnbooks)} hymnbooks",
        "hymnbooks": list(hymnbooks.keys())
    }
