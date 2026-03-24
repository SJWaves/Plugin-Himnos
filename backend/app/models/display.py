"""
Display Models
==============
Pydantic models for display configuration and state.
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class DisplayConfig(BaseModel):
    """Configuration for how hymns are displayed in OBS."""
    
    # Text settings
    fontSize: int = Field(default=48, ge=12, le=120, description="Font size in pixels")
    fontFamily: str = Field(default="Arial, sans-serif", description="Font family")
    textColor: str = Field(default="#FFFFFF", description="Text color (hex)")
    textAlign: Literal["left", "center", "right"] = Field(default="center")
    textShadow: bool = Field(default=True, description="Enable text shadow")
    normalizeLineBreaks: bool = Field(default=False, description="Normalize line breaks in verses")
    
    # Title settings
    showTitle: bool = Field(default=True, description="Show hymn title")
    titleFontSize: int = Field(default=28, ge=12, le=80)
    titleColor: str = Field(default="#C5A021", description="Title color (hex)")
    
    # Panel settings
    showPanel: bool = Field(default=False, description="Show background panel")
    panelBackground: str = Field(default="#000000", description="Panel background color")
    panelOpacity: float = Field(default=0.3, ge=0, le=1)
    panelBorderColor: str = Field(default="#C5A021")
    panelBlur: int = Field(default=16, ge=0, le=50)
    
    # Position settings
    position: Literal["top", "middle", "bottom"] = Field(default="bottom")
    horizontalAlignment: Literal["left", "center", "right"] = Field(default="center")
    verticalOffset: int = Field(default=0)
    horizontalOffset: int = Field(default=0)
    maxWidth: int = Field(default=1000, ge=200, le=2000)
    
    # Spacing
    padding: int = Field(default=20, ge=0, le=100)
    marginTop: int = Field(default=0, ge=0)
    marginBottom: int = Field(default=40, ge=0)
    marginLeft: int = Field(default=40, ge=0)
    marginRight: int = Field(default=40, ge=0)
    
    # Background effect
    showBackgroundGradient: bool = Field(default=False)
    
    class Config:
        json_schema_extra = {
            "example": {
                "fontSize": 48,
                "fontFamily": "Arial, sans-serif",
                "textColor": "#FFFFFF",
                "textAlign": "center",
                "showTitle": True,
                "position": "bottom"
            }
        }


class HymnDisplay(BaseModel):
    """Current display state for OBS."""
    
    hymnbook_id: str = Field(..., alias="hymnbookId")
    hymn_number: int = Field(..., alias="hymnNumber")
    hymn_title: str = Field(..., alias="hymnTitle")
    verse_index: int = Field(..., alias="verseIndex")
    verse_text: str = Field(..., alias="verseText")
    config: DisplayConfig = Field(default_factory=DisplayConfig)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "hymnbookId": "celebremos_su_gloria",
                "hymnNumber": 1,
                "hymnTitle": "Amazing Grace",
                "verseIndex": 0,
                "verseText": "Amazing grace! How sweet the sound...",
                "config": {}
            }
        }


class DisplayState(BaseModel):
    """Overall display state."""
    
    is_active: bool = Field(default=False, description="Whether display is currently active")
    current_display: Optional[HymnDisplay] = Field(default=None)
