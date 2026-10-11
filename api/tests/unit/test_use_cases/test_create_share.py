import pytest
from uuid import uuid4
from datetime import datetime, timezone
from app.application.use_cases.create_share import create_share
from app.application.use_cases.exceptions import BudgetNotFound
from app.application.dto.share_dto import CreateShareInput
from app.domain.entities.budget import Budget, BudgetState
from app.domain.entities.share import Share


def _make_budget(user_id: str = "u1") -> Budget:
    return Budget(
        id=uuid4(),
        user_id=user_id,
        name="My save",
        state=BudgetState.default(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


class MockBudgetRepo:
    def __init__(self, budget: Budget | None = None) -> None:
        self._budget = budget

    async def find_by_id(self, budget_id, user_id): return self._budget
    async def get_active(self, user_id): return None
    async def upsert_active(self, user_id, state): ...
    async def list_saves(self, user_id): return []
    async def create_save(self, user_id, name, state): ...
    async def update_save(self, budget_id, user_id, name, state): ...
    async def delete_save(self, budget_id, user_id): ...


class MockShareRepo:
    def __init__(self) -> None:
        self.created: Share | None = None

    async def create(self, budget_id, token, permission, expires_at) -> Share:
        self.created = Share(
            id=uuid4(),
            budget_id=budget_id,
            token=token,
            permission=permission,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
        )
        return self.created

    async def find_by_token(self, token): return None


@pytest.mark.asyncio
async def test_creates_share_with_token():
    budget = _make_budget("alice")
    inp = CreateShareInput(budget_id=budget.id, user_id="alice", permission="view")
    share = await create_share(inp, MockBudgetRepo(budget=budget), MockShareRepo())
    assert share.permission == "view"
    assert len(share.token) > 20  # token_urlsafe(32) produces ~43 chars


@pytest.mark.asyncio
async def test_raises_when_budget_not_found():
    inp = CreateShareInput(budget_id=uuid4(), user_id="alice", permission="view")
    with pytest.raises(BudgetNotFound):
        await create_share(inp, MockBudgetRepo(budget=None), MockShareRepo())
