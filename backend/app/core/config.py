from functools import lru_cache

from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Dynamic Pricing & Business Rules Engine"
    app_env: str = "development"
    debug: bool = True

    mysql_root_password: str
    mysql_database: str
    mysql_user: str
    mysql_password: str
    mysql_host: str = "mysql"
    mysql_port: int = 3306

    database_url: str

    redis_host: str = "redis"
    redis_port: int = 6379

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    admin_username: str = "admin"
    admin_email: EmailStr
    admin_password: str

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()