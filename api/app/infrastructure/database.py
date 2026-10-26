from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from .config import settings


def _normalise_url(url: str) -> str:
    return (
        url
        .replace("postgresql://", "postgresql+asyncpg://", 1)
        .replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        .replace("sslmode=require", "ssl=require")
        .replace("&channel_binding=require", "")
        .replace("channel_binding=require&", "")
        .replace("channel_binding=require", "")
    )


engine = create_async_engine(_normalise_url(settings.database_url), echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
