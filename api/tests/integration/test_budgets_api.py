import pytest
from httpx import AsyncClient

USER_ID = "test-user-1"
HEADERS = {"x-user-id": USER_ID}
EMPTY_STATE = {
    "takeHome": 0, "roleLabel": "", "annualSalary": 0, "annualBonus": 0,
    "needs": [], "wants": [], "savings": [], "oneOff": [], "bonus": [],
}


@pytest.mark.asyncio
async def test_get_active_creates_default(client: AsyncClient):
    r = await client.get(f"/api/v1/users/{USER_ID}/budget/active", headers=HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert data["state"]["takeHome"] == 0
    assert data["name"] is None


@pytest.mark.asyncio
async def test_upsert_active_persists_state(client: AsyncClient):
    state = {**EMPTY_STATE, "takeHome": 2500.0, "needs": [{"label": "Rent", "amount": 900}]}
    r = await client.put(
        f"/api/v1/users/{USER_ID}/budget/active",
        json={"state": state},
        headers=HEADERS,
    )
    assert r.status_code == 200
    assert r.json()["state"]["takeHome"] == 2500.0

    r2 = await client.get(f"/api/v1/users/{USER_ID}/budget/active", headers=HEADERS)
    assert r2.json()["state"]["takeHome"] == 2500.0


@pytest.mark.asyncio
async def test_create_and_list_saves(client: AsyncClient):
    state = {**EMPTY_STATE, "takeHome": 1800.0}
    r = await client.post(
        f"/api/v1/users/{USER_ID}/budgets",
        json={"name": "September", "state": state},
        headers=HEADERS,
    )
    assert r.status_code == 201
    budget_id = r.json()["id"]

    r2 = await client.get(f"/api/v1/users/{USER_ID}/budgets", headers=HEADERS)
    assert r2.status_code == 200
    assert any(b["id"] == budget_id for b in r2.json())


@pytest.mark.asyncio
async def test_delete_save(client: AsyncClient):
    state = {**EMPTY_STATE, "takeHome": 1000.0}
    r = await client.post(
        f"/api/v1/users/{USER_ID}/budgets",
        json={"name": "To delete", "state": state},
        headers=HEADERS,
    )
    budget_id = r.json()["id"]

    del_r = await client.delete(
        f"/api/v1/users/{USER_ID}/budgets/{budget_id}", headers=HEADERS
    )
    assert del_r.status_code == 204

    list_r = await client.get(f"/api/v1/users/{USER_ID}/budgets", headers=HEADERS)
    assert not any(b["id"] == budget_id for b in list_r.json())


@pytest.mark.asyncio
async def test_forbidden_for_other_user(client: AsyncClient):
    r = await client.get(
        f"/api/v1/users/other-user/budget/active",
        headers=HEADERS,
    )
    assert r.status_code == 403
