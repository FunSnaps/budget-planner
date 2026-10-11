import pytest
from httpx import AsyncClient

USER_ID = "share-test-user"
HEADERS = {"x-user-id": USER_ID}
EMPTY_STATE = {
    "takeHome": 0, "roleLabel": "", "annualSalary": 0, "annualBonus": 0,
    "needs": [], "wants": [], "savings": [], "oneOff": [], "bonus": [],
}


@pytest.mark.asyncio
async def test_create_and_resolve_share(client: AsyncClient):
    # Create a named save first
    r = await client.post(
        f"/api/v1/users/{USER_ID}/budgets",
        json={"name": "Shared budget", "state": {**EMPTY_STATE, "takeHome": 3000}},
        headers=HEADERS,
    )
    assert r.status_code == 201
    budget_id = r.json()["id"]

    # Create share link
    share_r = await client.post(
        f"/api/v1/users/{USER_ID}/budgets/{budget_id}/share",
        json={"permission": "view"},
        headers=HEADERS,
    )
    assert share_r.status_code == 201
    token = share_r.json()["token"]
    assert len(token) > 20

    # Resolve share (no auth header required)
    resolve_r = await client.get(f"/api/v1/shared/{token}")
    assert resolve_r.status_code == 200
    data = resolve_r.json()
    assert data["permission"] == "view"
    assert data["budget"]["state"]["takeHome"] == 3000


@pytest.mark.asyncio
async def test_resolve_unknown_token_returns_404(client: AsyncClient):
    r = await client.get("/api/v1/shared/nonexistent-token")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_share_unknown_budget_returns_404(client: AsyncClient):
    fake_id = "00000000-0000-0000-0000-000000000000"
    r = await client.post(
        f"/api/v1/users/{USER_ID}/budgets/{fake_id}/share",
        json={"permission": "view"},
        headers=HEADERS,
    )
    assert r.status_code == 404
