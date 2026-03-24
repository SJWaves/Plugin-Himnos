"""
Text Utilities
==============
Helper functions for text processing.
"""

import re
from typing import List


def normalize_text(text: str) -> str:
    """
    Normalize text by removing excessive whitespace and line breaks.
    
    Args:
        text: The input text to normalize.
    
    Returns:
        Normalized text with consistent spacing.
    """
    # Handle CORO (chorus) marked text
    if "@CORO@" in text:
        parts = text.split('\n')
        header = parts[0]
        body = '\n'.join(parts[1:])
        
        normalized_body = re.sub(r'\r\n', '\n', body)
        blocks = re.split(r'\n{2,}', normalized_body)
        normalized_blocks = [
            re.sub(r'\n+', ' ', block).strip()
            for block in blocks
            if block.strip()
        ]
        
        return f"{header}\n{chr(10).join(normalized_blocks)}"
    
    # Regular text normalization
    text = re.sub(r'\r\n', '\n', text)
    blocks = re.split(r'\n{2,}', text)
    normalized_blocks = [
        re.sub(r'\n+', ' ', block).strip()
        for block in blocks
        if block.strip()
    ]
    
    return '\n\n'.join(normalized_blocks)


def hex_to_rgb(hex_color: str) -> tuple:
    """
    Convert hex color to RGB tuple.
    
    Args:
        hex_color: Hex color string (e.g., "#FFFFFF" or "FFFFFF")
    
    Returns:
        Tuple of (r, g, b) values (0-255)
    """
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return (0, 0, 0)
    
    try:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b)
    except ValueError:
        return (0, 0, 0)


def hex_to_rgba(hex_color: str, alpha: float) -> str:
    """
    Convert hex color to rgba string.
    
    Args:
        hex_color: Hex color string
        alpha: Alpha value (0-1)
    
    Returns:
        RGBA string (e.g., "rgba(255, 255, 255, 0.5)")
    """
    r, g, b = hex_to_rgb(hex_color)
    alpha = max(0, min(1, alpha))
    return f"rgba({r}, {g}, {b}, {alpha})"


def clamp(value: float, min_val: float, max_val: float) -> float:
    """
    Clamp a value between min and max.
    
    Args:
        value: The value to clamp
        min_val: Minimum allowed value
        max_val: Maximum allowed value
    
    Returns:
        Clamped value
    """
    return max(min_val, min(max_val, value))


def is_valid_hex_color(hex_color: str) -> bool:
    """
    Validate a hex color string.
    
    Args:
        hex_color: The hex color to validate
    
    Returns:
        True if valid, False otherwise
    """
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return False
    
    try:
        int(hex_color, 16)
        return True
    except ValueError:
        return False
