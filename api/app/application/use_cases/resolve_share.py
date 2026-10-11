from datetime import datetime, timezone
from ...domain.entities.share import ResolvedShare
from ...domain.repositories.share_repository import ShareRepository
from .exceptions import ShareNotFound, ShareExpired


async def resolve_share(token: str, repo: ShareRepository) -> ResolvedShare:
    result = await repo.find_by_token(token)
    if result is None:
        raise ShareNotFound(f"Share token not found: {token}")
    if result.expires_at and result.expires_at < datetime.now(timezone.utc):
        raise ShareExpired("Share link has expired")
    return result
