"""
Tests for services.
"""

import pytest
from app.services.hymn_service import HymnService
from app.services.display_service import DisplayService
from app.models.display import DisplayConfig


def test_hymn_service_get_all_hymnbooks():
    """Test getting all hymnbooks."""
    hymnbooks = HymnService.get_all_hymnbooks()
    assert isinstance(hymnbooks, dict)


def test_display_service_get_config():
    """Test getting display config."""
    config = DisplayService.get_config()
    assert isinstance(config, DisplayConfig)
    assert config.fontSize > 0
    assert config.textColor is not None


def test_display_service_get_state():
    """Test getting display state."""
    state = DisplayService.get_state()
    assert hasattr(state, 'is_active')
    assert hasattr(state, 'current_display')
