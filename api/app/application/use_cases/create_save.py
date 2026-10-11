from ...domain.entities.budget import Budget
from ...domain.repositories.budget_repository import BudgetRepository
from ..dto.budget_dto import CreateSaveInput


async def create_save(inp: CreateSaveInput, repo: BudgetRepository) -> Budget:
    return await repo.create_save(inp.user_id, inp.name, inp.state)
