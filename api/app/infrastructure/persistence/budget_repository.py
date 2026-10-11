from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ...domain.entities.budget import Budget, BudgetState, BudgetStateItem
from .orm_models import BudgetORM


# ---------- mapping helpers ----------

def _items_from_list(raw: list[dict]) -> list[BudgetStateItem]:
    return [BudgetStateItem(label=i["label"], amount=float(i["amount"])) for i in raw]


def _state_from_dict(d: dict) -> BudgetState:
    return BudgetState(
        take_home=float(d.get("takeHome", 0)),
        role_label=str(d.get("roleLabel", "")),
        annual_salary=float(d.get("annualSalary", 0)),
        annual_bonus=float(d.get("annualBonus", 0)),
        needs=_items_from_list(d.get("needs", [])),
        wants=_items_from_list(d.get("wants", [])),
        savings=_items_from_list(d.get("savings", [])),
        one_off=_items_from_list(d.get("oneOff", [])),
        bonus=_items_from_list(d.get("bonus", [])),
    )


def _items_to_list(items: list[BudgetStateItem]) -> list[dict]:
    return [{"label": i.label, "amount": i.amount} for i in items]


def _state_to_dict(s: BudgetState) -> dict:
    return {
        "takeHome": s.take_home,
        "roleLabel": s.role_label,
        "annualSalary": s.annual_salary,
        "annualBonus": s.annual_bonus,
        "needs": _items_to_list(s.needs),
        "wants": _items_to_list(s.wants),
        "savings": _items_to_list(s.savings),
        "oneOff": _items_to_list(s.one_off),
        "bonus": _items_to_list(s.bonus),
    }


def _orm_to_entity(orm: BudgetORM) -> Budget:
    return Budget(
        id=orm.id,
        user_id=orm.user_id,
        name=orm.name,
        state=_state_from_dict(orm.state),
        created_at=orm.created_at,
        updated_at=orm.updated_at,
    )


# ---------- repository ----------

class SQLAlchemyBudgetRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_active(self, user_id: str) -> Budget | None:
        result = await self._session.execute(
            select(BudgetORM).where(
                and_(BudgetORM.user_id == user_id, BudgetORM.name.is_(None))
            )
        )
        orm = result.scalar_one_or_none()
        return _orm_to_entity(orm) if orm else None

    async def upsert_active(self, user_id: str, state: BudgetState) -> Budget:
        result = await self._session.execute(
            select(BudgetORM).where(
                and_(BudgetORM.user_id == user_id, BudgetORM.name.is_(None))
            )
        )
        orm = result.scalar_one_or_none()
        if orm is None:
            orm = BudgetORM(user_id=user_id, name=None, state=_state_to_dict(state))
            self._session.add(orm)
        else:
            orm.state = _state_to_dict(state)
            orm.updated_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(orm)
        return _orm_to_entity(orm)

    async def list_saves(self, user_id: str) -> list[Budget]:
        result = await self._session.execute(
            select(BudgetORM)
            .where(and_(BudgetORM.user_id == user_id, BudgetORM.name.is_not(None)))
            .order_by(BudgetORM.updated_at.desc())
        )
        return [_orm_to_entity(orm) for orm in result.scalars().all()]

    async def create_save(self, user_id: str, name: str, state: BudgetState) -> Budget:
        orm = BudgetORM(user_id=user_id, name=name, state=_state_to_dict(state))
        self._session.add(orm)
        await self._session.commit()
        await self._session.refresh(orm)
        return _orm_to_entity(orm)

    async def update_save(
        self,
        budget_id: UUID,
        user_id: str,
        name: str | None,
        state: BudgetState | None,
    ) -> Budget:
        result = await self._session.execute(
            select(BudgetORM).where(
                and_(
                    BudgetORM.id == budget_id,
                    BudgetORM.user_id == user_id,
                    BudgetORM.name.is_not(None),
                )
            )
        )
        orm = result.scalar_one_or_none()
        if orm is None:
            raise ValueError(f"Budget {budget_id} not found")
        if name is not None:
            orm.name = name
        if state is not None:
            orm.state = _state_to_dict(state)
        orm.updated_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(orm)
        return _orm_to_entity(orm)

    async def delete_save(self, budget_id: UUID, user_id: str) -> None:
        result = await self._session.execute(
            select(BudgetORM).where(
                and_(
                    BudgetORM.id == budget_id,
                    BudgetORM.user_id == user_id,
                    BudgetORM.name.is_not(None),
                )
            )
        )
        orm = result.scalar_one_or_none()
        if orm:
            await self._session.delete(orm)
            await self._session.commit()

    async def find_by_id(self, budget_id: UUID, user_id: str) -> Budget | None:
        result = await self._session.execute(
            select(BudgetORM).where(
                and_(BudgetORM.id == budget_id, BudgetORM.user_id == user_id)
            )
        )
        orm = result.scalar_one_or_none()
        return _orm_to_entity(orm) if orm else None
