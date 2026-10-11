from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Any

from ....domain.entities.budget import Budget, BudgetState, BudgetStateItem


# ---------- request schemas (HTTP → domain) ----------

class BudgetStateItemSchema(BaseModel):
    label: str = Field(max_length=200)
    amount: float


class BudgetStateSchema(BaseModel):
    takeHome: float = Field(ge=0)
    roleLabel: str = Field(default="", max_length=200)
    annualSalary: float = Field(ge=0)
    annualBonus: float = Field(ge=0)
    needs: list[BudgetStateItemSchema] = Field(default_factory=list)
    wants: list[BudgetStateItemSchema] = Field(default_factory=list)
    savings: list[BudgetStateItemSchema] = Field(default_factory=list)
    oneOff: list[BudgetStateItemSchema] = Field(default_factory=list)
    bonus: list[BudgetStateItemSchema] = Field(default_factory=list)


class UpsertActiveRequest(BaseModel):
    state: BudgetStateSchema


class CreateSaveRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    state: BudgetStateSchema


class UpdateSaveRequest(BaseModel):
    name: str | None = Field(default=None, max_length=60)
    state: BudgetStateSchema | None = None


# ---------- response schemas (domain → HTTP) ----------

class BudgetOut(BaseModel):
    id: UUID
    name: str | None
    state: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, budget: Budget) -> "BudgetOut":
        def items(lst: list[BudgetStateItem]) -> list[dict]:
            return [{"label": i.label, "amount": i.amount} for i in lst]

        state = {
            "takeHome": budget.state.take_home,
            "roleLabel": budget.state.role_label,
            "annualSalary": budget.state.annual_salary,
            "annualBonus": budget.state.annual_bonus,
            "needs": items(budget.state.needs),
            "wants": items(budget.state.wants),
            "savings": items(budget.state.savings),
            "oneOff": items(budget.state.one_off),
            "bonus": items(budget.state.bonus),
        }
        return cls(
            id=budget.id,
            name=budget.name,
            state=state,
            created_at=budget.created_at,
            updated_at=budget.updated_at,
        )


# ---------- converter: request schema → domain ----------

def to_domain_state(schema: BudgetStateSchema) -> BudgetState:
    def items(lst: list[BudgetStateItemSchema]) -> list[BudgetStateItem]:
        return [BudgetStateItem(label=i.label, amount=i.amount) for i in lst]

    return BudgetState(
        take_home=schema.takeHome,
        role_label=schema.roleLabel,
        annual_salary=schema.annualSalary,
        annual_bonus=schema.annualBonus,
        needs=items(schema.needs),
        wants=items(schema.wants),
        savings=items(schema.savings),
        one_off=items(schema.oneOff),
        bonus=items(schema.bonus),
    )
