from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...domain.entities.share import Share, ResolvedShare
from .budget_repository import _orm_to_entity
from .orm_models import ShareORM, BudgetORM


def _share_orm_to_entity(orm: ShareORM) -> Share:
    return Share(
        id=orm.id,
        budget_id=orm.budget_id,
        token=orm.token,
        permission=orm.permission,
        expires_at=orm.expires_at,
        created_at=orm.created_at,
    )


class SQLAlchemyShareRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        budget_id: UUID,
        token: str,
        permission: str,
        expires_at: datetime | None,
    ) -> Share:
        orm = ShareORM(
            budget_id=budget_id,
            token=token,
            permission=permission,
            expires_at=expires_at,
        )
        self._session.add(orm)
        await self._session.commit()
        await self._session.refresh(orm)
        return _share_orm_to_entity(orm)

    async def find_by_token(self, token: str) -> ResolvedShare | None:
        share_result = await self._session.execute(
            select(ShareORM).where(ShareORM.token == token)
        )
        share_orm = share_result.scalar_one_or_none()
        if share_orm is None:
            return None

        budget_result = await self._session.execute(
            select(BudgetORM).where(BudgetORM.id == share_orm.budget_id)
        )
        budget_orm = budget_result.scalar_one_or_none()
        if budget_orm is None:
            return None

        return ResolvedShare(
            budget=_orm_to_entity(budget_orm),
            permission=share_orm.permission,
            expires_at=share_orm.expires_at,
        )
