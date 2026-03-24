"""
Hymn Models
===========
Pydantic models for hymns and hymnbooks.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class Hymn(BaseModel):
    """Model representing a single hymn."""
    
    number: int = Field(..., description="Hymn number in the hymnbook")
    title: str = Field(..., description="Title of the hymn")
    verses: List[str] = Field(default_factory=list, description="List of verses/stanzas")
    
    class Config:
        json_schema_extra = {
            "example": {
                "number": 1,
                "title": "Amazing Grace",
                "verses": [
                    "Amazing grace! How sweet the sound\nThat saved a wretch like me!",
                    "I once was lost, but now am found;\nWas blind, but now I see."
                ]
            }
        }


class Hymnbook(BaseModel):
    """Model representing a collection of hymns."""
    
    id: str = Field(..., description="Unique identifier for the hymnbook")
    name: str = Field(..., description="Display name of the hymnbook")
    hymns: List[Hymn] = Field(default_factory=list, description="List of hymns")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "celebremos_su_gloria",
                "name": "Celebremos Su Gloria",
                "hymns": []
            }
        }


class HymnSearchQuery(BaseModel):
    """Search query parameters for hymns."""
    
    query: str = Field(default="", description="Search query (number or title)")
    hymnbook_id: str = Field(..., description="ID of the hymnbook to search in")


class HymnSearchResult(BaseModel):
    """Search result containing matching hymns."""
    
    hymns: List[Hymn] = Field(default_factory=list)
    total: int = Field(default=0)


class SavedHymn(BaseModel):
    """Model for a saved/bookmarked hymn."""
    
    hymnbook_id: str = Field(..., description="ID of the hymnbook")
    hymnbook_name: str = Field(..., description="Name of the hymnbook")
    hymn: Hymn = Field(..., description="The saved hymn data")
