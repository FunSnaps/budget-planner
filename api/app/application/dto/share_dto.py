from dataclasses import dataclass, field
from uuid import UUID
from datetime import datetime


@dataclass
class CreateShareInput:
    budget_id: UUID
    user_id: str
    permission: str
    expires_at: datetime | None = field(default=None)
