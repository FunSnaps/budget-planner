from uuid import UUID
from ...domain.repositories.budget_repository import BudgetRepository
from .exceptions import BudgetNotFound


async def delete_save(budget_id: UUID, user_id: str, repo: BudgetRepository) -> None:
    existing = await repo.find_by_id(budget_id, user_id)
    if existing is None:
        raise BudgetNotFound(f"Budget {budget_id} not found for user {user_id}")
    await repo.delete_save(budget_id, user_id)
