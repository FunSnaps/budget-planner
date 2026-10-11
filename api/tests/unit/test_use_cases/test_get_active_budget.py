import pytest
from uuid import uuid4
from datetime import datetime, timezone
from app.application.use_cases.get_active_budget import get_active_budget
from app.domain.entities.budget import Budget, BudgetState


def _make_budget(user_id: str = "u1") -> Budget:
    return Budget(
        id=uuid4(),
        user_id=user_id,
        name=None,
        state=BudgetState.default(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


class MockBudgetRepo:
    def __init__(self, existing: Budget | None = None) -> None:
        self._existing = existing
        self.upserted: BudgetState | None = None

    async def get_active(self, user_id: str) -> Budget | None:
        return self._existing

    async def upsert_active(self, user_id: str, state: BudgetState) -> Budget:
        self.upserted = state
        return Budget(
            id=uuid4(),
            user_id=user_id,
            name=None,
            state=state,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    # unused stubs to satisfy the Protocol
    async def list_saves(self, user_id): return []
    async def create_save(self, user_id, name, state): ...
    async def update_save(self, budget_id, user_id, name, state): ...
    async def delete_save(self, budget_id, user_id): ...
    async def find_by_id(self, budget_id, user_id): return None


@pytest.mark.asyncio
async def test_returns_existing_budget():
    existing = _make_budget("alice")
    repo = MockBudgetRepo(existing=existing)
    result = await get_active_budget("alice", repo)
    assert result is existing
    assert repo.upserted is None  # did not create a new one


@pytest.mark.asyncio
async def test_creates_default_when_none_exists():
    repo = MockBudgetRepo(existing=None)
    result = await get_active_budget("bob", repo)
    assert result.user_id == "bob"
    assert repo.upserted is not None
    assert repo.upserted.take_home == 0
