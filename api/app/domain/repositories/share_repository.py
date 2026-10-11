from typing import Protocol, runtime_checkable
from uuid import UUID
from datetime import datetime
from ..entities.share import Share, ResolvedShare


@runtime_checkable
class ShareRepository(Protocol):
    async def create(
        self,
        budget_id: UUID,
        token: str,
        permission: str,
        expires_at: datetime | None,
    ) -> Share: ...
    async def find_by_token(self, token: str) -> ResolvedShare | None: ...
