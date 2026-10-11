from __future__ import annotations
from dataclasses import dataclass, field
from uuid import UUID
from datetime import datetime


@dataclass
class BudgetStateItem:
    label: str
    amount: float


@dataclass
class BudgetState:
    take_home: float
    role_label: str
    annual_salary: float
    annual_bonus: float
    needs: list[BudgetStateItem] = field(default_factory=list)
    wants: list[BudgetStateItem] = field(default_factory=list)
    savings: list[BudgetStateItem] = field(default_factory=list)
    one_off: list[BudgetStateItem] = field(default_factory=list)
    bonus: list[BudgetStateItem] = field(default_factory=list)

    @staticmethod
    def default() -> BudgetState:
        return BudgetState(
            take_home=0,
            role_label="",
            annual_salary=0,
            annual_bonus=0,
        )


@dataclass
class Budget:
    id: UUID
    user_id: str
    name: str | None
    state: BudgetState
    created_at: datetime
    updated_at: datetime
