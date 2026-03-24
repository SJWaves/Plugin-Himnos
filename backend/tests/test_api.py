"""
Tests for Hymn API endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_root_endpoint(client: AsyncClient):
    """Test the root endpoint returns health status."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    """Test the health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.anyio
async def test_list_hymnbooks(client: AsyncClient):
    """Test listing all hymnbooks."""
    response = await client.get("/api/hymns/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


@pytest.mark.anyio
async def test_get_config(client: AsyncClient):
    """Test getting display configuration."""
    response = await client.get("/api/config/")
    assert response.status_code == 200
    data = response.json()
    assert "fontSize" in data
    assert "textColor" in data


@pytest.mark.anyio
async def test_get_display_state(client: AsyncClient):
    """Test getting display state."""
    response = await client.get("/api/display/state")
    assert response.status_code == 200
    data = response.json()
    assert "is_active" in data
