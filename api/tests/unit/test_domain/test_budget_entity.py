from app.domain.entities.budget import Budget, BudgetState, BudgetStateItem
from uuid import uuid4
from datetime import datetime, timezone


def test_budget_state_default_has_zero_take_home():
    state = BudgetState.default()
    assert state.take_home == 0
    assert state.needs == []
    assert state.savings == []


def test_budget_state_item_holds_label_and_amount():
    item = BudgetStateItem(label="Rent", amount=900.0)
    assert item.label == "Rent"
    assert item.amount == 900.0


def test_budget_dataclass_fields():
    now = datetime.now(timezone.utc)
    state = BudgetState.default()
    budget = Budget(
        id=uuid4(),
        user_id="user-1",
        name=None,
        state=state,
        created_at=now,
        updated_at=now,
    )
    assert budget.name is None
    assert budget.state is state
