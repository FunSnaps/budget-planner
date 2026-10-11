import secrets
from ...domain.entities.share import Share
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.repositories.share_repository import ShareRepository
from ..dto.share_dto import CreateShareInput
from .exceptions import BudgetNotFound


async def create_share(
    inp: CreateShareInput,
    budget_repo: BudgetRepository,
    share_repo: ShareRepository,
) -> Share:
    budget = await budget_repo.find_by_id(inp.budget_id, inp.user_id)
    if budget is None:
        raise BudgetNotFound(f"Budget {inp.budget_id} not found for user {inp.user_id}")
    token = secrets.token_urlsafe(32)
    return await share_repo.create(inp.budget_id, token, inp.permission, inp.expires_at)
