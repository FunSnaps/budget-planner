from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from .....application.use_cases import create_share, resolve_share
from .....application.use_cases.exceptions import BudgetNotFound, ShareNotFound, ShareExpired
from .....application.dto.share_dto import CreateShareInput
from .....domain.repositories.budget_repository import BudgetRepository
from .....domain.repositories.share_repository import ShareRepository
from ..schemas.share_schemas import CreateShareRequest, ShareOut, SharedBudgetOut
from ...dependencies import require_user, get_budget_repo, get_share_repo

router = APIRouter(prefix="/api/v1", tags=["shares"])


@router.post(
    "/users/{user_id}/budgets/{budget_id}/share",
    response_model=ShareOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_share_link(
    user_id: str,
    budget_id: UUID,
    body: CreateShareRequest,
    uid: str = Depends(require_user),
    budget_repo: BudgetRepository = Depends(get_budget_repo),
    share_repo: ShareRepository = Depends(get_share_repo),
) -> ShareOut:
    if uid != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    inp = CreateShareInput(
        budget_id=budget_id,
        user_id=user_id,
        permission=body.permission,
        expires_at=body.expires_at,
    )
    try:
        share = await create_share.create_share(inp, budget_repo, share_repo)
    except BudgetNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return ShareOut(token=share.token, permission=share.permission, expires_at=share.expires_at)


@router.get("/shared/{token}", response_model=SharedBudgetOut)
async def resolve_share_link(
    token: str,
    share_repo: ShareRepository = Depends(get_share_repo),
) -> SharedBudgetOut:
    try:
        resolved = await resolve_share.resolve_share(token, share_repo)
    except ShareNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found")
    except ShareExpired:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Share link has expired")
    return SharedBudgetOut.from_domain(resolved)
