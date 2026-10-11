from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from .....application.use_cases import (
    get_active_budget,
    upsert_active_budget,
    list_saves,
    create_save,
    update_save,
    delete_save,
)
from .....application.use_cases.exceptions import BudgetNotFound
from .....application.dto.budget_dto import (
    UpsertActiveInput,
    CreateSaveInput,
    UpdateSaveInput,
)
from .....domain.repositories.budget_repository import BudgetRepository
from ..schemas.budget_schemas import (
    BudgetOut,
    UpsertActiveRequest,
    CreateSaveRequest,
    UpdateSaveRequest,
    to_domain_state,
)
from ...dependencies import require_user, get_budget_repo

router = APIRouter(prefix="/api/v1", tags=["budgets"])


def _check_ownership(uid: str, user_id: str) -> None:
    if uid != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.get("/users/{user_id}/budget/active", response_model=BudgetOut)
async def get_active(
    user_id: str,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> BudgetOut:
    _check_ownership(uid, user_id)
    budget = await get_active_budget.get_active_budget(user_id, repo)
    return BudgetOut.from_domain(budget)


@router.put("/users/{user_id}/budget/active", response_model=BudgetOut)
async def upsert_active(
    user_id: str,
    body: UpsertActiveRequest,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> BudgetOut:
    _check_ownership(uid, user_id)
    inp = UpsertActiveInput(user_id=user_id, state=to_domain_state(body.state))
    budget = await upsert_active_budget.upsert_active_budget(inp, repo)
    return BudgetOut.from_domain(budget)


@router.get("/users/{user_id}/budgets", response_model=list[BudgetOut])
async def list_user_saves(
    user_id: str,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> list[BudgetOut]:
    _check_ownership(uid, user_id)
    budgets = await list_saves.list_saves(user_id, repo)
    return [BudgetOut.from_domain(b) for b in budgets]


@router.post(
    "/users/{user_id}/budgets",
    response_model=BudgetOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_save(
    user_id: str,
    body: CreateSaveRequest,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> BudgetOut:
    _check_ownership(uid, user_id)
    inp = CreateSaveInput(user_id=user_id, name=body.name, state=to_domain_state(body.state))
    budget = await create_save.create_save(inp, repo)
    return BudgetOut.from_domain(budget)


@router.put("/users/{user_id}/budgets/{budget_id}", response_model=BudgetOut)
async def update_user_save(
    user_id: str,
    budget_id: UUID,
    body: UpdateSaveRequest,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> BudgetOut:
    _check_ownership(uid, user_id)
    inp = UpdateSaveInput(
        budget_id=budget_id,
        user_id=user_id,
        name=body.name,
        state=to_domain_state(body.state) if body.state else None,
    )
    try:
        budget = await update_save.update_save(inp, repo)
    except BudgetNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return BudgetOut.from_domain(budget)


@router.delete(
    "/users/{user_id}/budgets/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user_save(
    user_id: str,
    budget_id: UUID,
    uid: str = Depends(require_user),
    repo: BudgetRepository = Depends(get_budget_repo),
) -> None:
    _check_ownership(uid, user_id)
    try:
        await delete_save.delete_save(budget_id, user_id, repo)
    except BudgetNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
