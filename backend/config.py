import os

class Config:
   
    SQLALCHEMY_DATABASE_URI = "postgresql://siteweather_user:mypassword@localhost/siteweather"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")
