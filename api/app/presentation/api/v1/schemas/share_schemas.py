from pydantic import BaseModel, Field
from datetime import datetime

from .budget_schemas import BudgetOut
from .....domain.entities.share import ResolvedShare


class CreateShareRequest(BaseModel):
    permission: str = Field(pattern="^(view|edit)$")
    expires_at: datetime | None = None


class ShareOut(BaseModel):
    token: str
    permission: str
    expires_at: datetime | None


class SharedBudgetOut(BaseModel):
    budget: BudgetOut
    permission: str

    @classmethod
    def from_domain(cls, resolved: ResolvedShare) -> "SharedBudgetOut":
        return cls(
            budget=BudgetOut.from_domain(resolved.budget),
            permission=resolved.permission,
        )
