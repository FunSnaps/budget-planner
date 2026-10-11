from ...domain.entities.budget import Budget
from ...domain.repositories.budget_repository import BudgetRepository


async def list_saves(user_id: str, repo: BudgetRepository) -> list[Budget]:
    return await repo.list_saves(user_id)
