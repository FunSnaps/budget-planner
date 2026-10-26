import os

# app.infrastructure.config reads DATABASE_URL at import time; tests never use this connection.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
