import os

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///siteweather.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get(
        "SECRET_KEY", "siteweather-development-secret-key-change-me"
    )
