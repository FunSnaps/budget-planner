from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    allowed_origin: str = "http://localhost:5173"
    env: str = "development"

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()  # type: ignore[call-arg]  # database_url comes from the environment
