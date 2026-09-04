import os


def database_url():
    value = os.environ.get("DATABASE_URL", "").strip() or "sqlite:///siteweather.db"
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql://", 1)
    return value

class Config:
    SQLALCHEMY_DATABASE_URI = database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get(
        "SECRET_KEY", "siteweather-development-secret-key-change-me"
    )
