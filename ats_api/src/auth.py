from fastapi import Header, HTTPException, status
from typing import Optional

from .config import get_settings, DEFAULT_API_KEY_ID


async def verify_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Verify the provided API key header.
    Returns the key_id if valid, raises 401 if not.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "missing_api_key", "message": "X-API-Key header is required."},
        )

    settings = get_settings()

    # Check if key_id matches
    key_id = x_api_key.strip()
    if key_id not in settings.VALID_API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "invalid_api_key", "message": "The provided API key is not valid."},
        )

    return key_id


def get_tier_for_key(key_id: str) -> str:
    """Get the pricing tier for an API key."""
    settings = get_settings()
    return settings.KEY_TIERS.get(key_id, settings.TIER_FREE)
