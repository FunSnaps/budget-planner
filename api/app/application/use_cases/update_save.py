from ...domain.entities.budget import Budget
from ...domain.repositories.budget_repository import BudgetRepository
from ..dto.budget_dto import UpdateSaveInput
from .exceptions import BudgetNotFound


async def update_save(inp: UpdateSaveInput, repo: BudgetRepository) -> Budget:
    existing = await repo.find_by_id(inp.budget_id, inp.user_id)
    if existing is None:
        raise BudgetNotFound(f"Budget {inp.budget_id} not found for user {inp.user_id}")
    return await repo.update_save(inp.budget_id, inp.user_id, inp.name, inp.state)
