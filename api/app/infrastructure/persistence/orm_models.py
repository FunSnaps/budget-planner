from sqlalchemy import JSON, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from datetime import datetime, timezone
import uuid


# JSONB on Postgres; plain JSON so the SQLite test database can create the table
JSONType = JSONB().with_variant(JSON(), "sqlite")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class BudgetORM(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str | None] = mapped_column(Text, nullable=True)
    state: Mapped[dict] = mapped_column(JSONType, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )


class ShareORM(Base):
    __tablename__ = "shares"
    __table_args__ = (
        CheckConstraint(
            "permission IN ('view', 'edit')", name="shares_permission_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    budget_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("budgets.id", ondelete="CASCADE"),
        nullable=False,
    )
    token: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    permission: Mapped[str] = mapped_column(String(4), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
