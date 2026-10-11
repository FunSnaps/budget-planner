from ...domain.entities.budget import Budget, BudgetState
from ...domain.repositories.budget_repository import BudgetRepository


async def get_active_budget(user_id: str, repo: BudgetRepository) -> Budget:
    budget = await repo.get_active(user_id)
    if budget is None:
        budget = await repo.upsert_active(user_id, BudgetState.default())
    return budget
