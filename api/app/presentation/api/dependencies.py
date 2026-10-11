from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...infrastructure.database import get_db
from ...infrastructure.persistence.budget_repository import SQLAlchemyBudgetRepository
from ...infrastructure.persistence.share_repository import SQLAlchemyShareRepository
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.repositories.share_repository import ShareRepository


async def require_user(x_user_id: str = Header(..., alias="x-user-id")) -> str:
    if not x_user_id or len(x_user_id) > 255:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid user identity header",
        )
    return x_user_id


async def get_budget_repo(db: AsyncSession = Depends(get_db)) -> BudgetRepository:
    return SQLAlchemyBudgetRepository(db)  # type: ignore[return-value]


async def get_share_repo(db: AsyncSession = Depends(get_db)) -> ShareRepository:
    return SQLAlchemyShareRepository(db)  # type: ignore[return-value]
