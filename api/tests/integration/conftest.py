import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event as sa_event

from app.presentation.main import app
from app.infrastructure.persistence.orm_models import Base
from app.presentation.api.dependencies import get_db, get_budget_repo, get_share_repo
from app.infrastructure.persistence.budget_repository import SQLAlchemyBudgetRepository
from app.infrastructure.persistence.share_repository import SQLAlchemyShareRepository

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_session():
    engine = create_async_engine(TEST_DB_URL, echo=False)

    # SQLite needs native UUID support enabled
    @sa_event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA journal_mode=WAL")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def _override_db():
        yield db_session

    async def _override_budget_repo():
        return SQLAlchemyBudgetRepository(db_session)

    async def _override_share_repo():
        return SQLAlchemyShareRepository(db_session)

    app.dependency_overrides[get_db] = _override_db
    app.dependency_overrides[get_budget_repo] = _override_budget_repo
    app.dependency_overrides[get_share_repo] = _override_share_repo

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
