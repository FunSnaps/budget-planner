from dataclasses import dataclass
from uuid import UUID
from ...domain.entities.budget import BudgetState


@dataclass
class UpsertActiveInput:
    user_id: str
    state: BudgetState


@dataclass
class CreateSaveInput:
    user_id: str
    name: str
    state: BudgetState


@dataclass
class UpdateSaveInput:
    budget_id: UUID
    user_id: str
    name: str | None = None
    state: BudgetState | None = None
