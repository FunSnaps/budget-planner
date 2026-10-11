from ...domain.entities.budget import Budget
from ...domain.repositories.budget_repository import BudgetRepository
from ..dto.budget_dto import UpsertActiveInput


async def upsert_active_budget(inp: UpsertActiveInput, repo: BudgetRepository) -> Budget:
    return await repo.upsert_active(inp.user_id, inp.state)
