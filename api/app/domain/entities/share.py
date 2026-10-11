from __future__ import annotations
from dataclasses import dataclass
from uuid import UUID
from datetime import datetime
from .budget import Budget


@dataclass
class Share:
    id: UUID
    budget_id: UUID
    token: str
    permission: str  # "view" | "edit"
    expires_at: datetime | None
    created_at: datetime


@dataclass
class ResolvedShare:
    budget: Budget
    permission: str
    expires_at: datetime | None
