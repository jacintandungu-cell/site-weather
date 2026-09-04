from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from sqlalchemy.engine import make_url
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from datetime import timedelta
import hashlib
import hmac
import json
import os
import secrets
import smtplib
from email.message import EmailMessage
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

app = Flask(__name__)

database_url = os.environ.get("DATABASE_URL", "").strip()
is_production = os.environ.get("FLASK_ENV") == "production" or bool(os.environ.get("RENDER"))
if not database_url:
    if is_production:
        raise RuntimeError("DATABASE_URL must be set in production")
    database_url = "sqlite:///siteweather.db"
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
try:
    make_url(database_url)
except Exception as error:
    raise RuntimeError("DATABASE_URL must be a valid SQLAlchemy database URL") from error
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY")
if not app.config['SECRET_KEY'] or not app.config['JWT_SECRET_KEY']:
    if is_production:
        raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be configured in production")
    app.config['SECRET_KEY'] = app.config['SECRET_KEY'] or "local-development-secret-key"
    app.config['JWT_SECRET_KEY'] = app.config['JWT_SECRET_KEY'] or app.config['SECRET_KEY']

db = SQLAlchemy(app)
Migrate(app, db)
JWTManager(app)
frontend_origins = os.environ.get("FRONTEND_URL", "http://localhost:3000")
CORS(app, resources={
    r"/api/*": {"origins": [origin.strip() for origin in frontend_origins.split(",")]},
    r"/": {"origins": [origin.strip() for origin in frontend_origins.split(",")]}
})


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(422)
def unprocessable_entity(error):
    return jsonify({"error": "Unprocessable entity"}), 422


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(Exception)
def unhandled_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500


# User model
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    tasks = db.relationship("Task", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Task model
class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    scheduled_date = db.Column(db.Date, nullable=True)
    weather_sensitive = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default="pending")

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)


class PasswordResetCode(db.Model):
    __tablename__ = "password_reset_codes"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    code_hash = db.Column(db.String(64), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    attempts = db.Column(db.Integer, nullable=False, default=0)
    used_at = db.Column(db.DateTime, nullable=True)


@app.route("/")
def index():
    return jsonify({"message": "SiteWeather API running"})


# ---------------- USER ROUTES ----------------
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json(silent=True) or {}
    required = ["name", "email", "role", "password"]
    if any(not data.get(field) for field in required):
        return jsonify({"error": "name, email, role, and password are required"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "email already exists"}), 409
    user = User(name=data["name"], email=data["email"], role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({
        "message": "User created successfully",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "access_token": create_access_token(identity=str(user.id)),
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=data.get("email", "")).first()
    if user is None or not user.check_password(data.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "access_token": create_access_token(identity=str(user.id)),
    })


def openweather(endpoint, city):
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        return jsonify({"error": "Weather service is not configured"}), 503
    query = urlencode({"q": city, "appid": api_key, "units": "metric"})
    try:
        with urlopen(f"https://api.openweathermap.org/data/2.5/{endpoint}?{query}", timeout=10) as response:
            return jsonify(json.loads(response.read().decode("utf-8"))), response.status
    except HTTPError as error:
        if error.code == 404:
            return jsonify({"error": "Site location not found"}), 404
        if error.code == 401:
            return jsonify({"error": "Weather service credentials are invalid"}), 502
        return jsonify({"error": "Weather service is unavailable"}), 502
    except (TimeoutError, URLError):
        return jsonify({"error": "Weather service is unavailable"}), 502


@app.route("/api/weather/<view>", methods=["GET"])
def weather(view):
    endpoints = {"current": "weather", "forecast": "forecast"}
    endpoint = endpoints.get(view)
    if endpoint is None:
        return jsonify({"error": "Unknown weather endpoint"}), 404
    city = request.args.get("city", "").strip()
    if not city:
        return jsonify({"error": "city is required"}), 400
    return openweather(endpoint, city)


def send_reset_email(recipient, code):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    sender = os.environ.get("SMTP_FROM", smtp_username)
    if not all([smtp_host, smtp_username, smtp_password, sender]):
        raise RuntimeError("Password reset email is not configured")

    message = EmailMessage()
    message["Subject"] = "Your Site Weather password reset code"
    message["From"] = sender
    message["To"] = recipient
    message.set_content(f"Your Site Weather password reset code is {code}. It expires in 10 minutes.")
    with smtplib.SMTP(smtp_host, int(os.environ.get("SMTP_PORT", "587")), timeout=10) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)


@app.route("/api/auth/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    user = User.query.filter_by(email=email).first()
    if user:
        code = f"{secrets.randbelow(1000000):06d}"
        reset = PasswordResetCode(
            user_id=user.id,
            code_hash=hashlib.sha256(code.encode()).hexdigest(),
            expires_at=datetime.utcnow() + timedelta(minutes=10),
        )
        db.session.add(reset)
        db.session.commit()
        try:
            send_reset_email(user.email, code)
        except Exception:
            db.session.delete(reset)
            db.session.commit()
            return jsonify({"error": "Password reset email is currently unavailable"}), 503
    return jsonify({"message": "If an account exists for that email, a reset code has been sent."})


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    password = data.get("password", "")
    user = User.query.filter_by(email=email).first()
    reset = PasswordResetCode.query.join(User).filter(
        User.email == email,
        PasswordResetCode.used_at.is_(None),
        PasswordResetCode.expires_at > datetime.utcnow(),
    ).order_by(PasswordResetCode.id.desc()).first() if user else None
    if not reset or reset.attempts >= 5:
        return jsonify({"error": "Invalid or expired reset code"}), 400
    reset.attempts += 1
    if not hmac.compare_digest(reset.code_hash, hashlib.sha256(code.encode()).hexdigest()):
        db.session.commit()
        return jsonify({"error": "Invalid or expired reset code"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    user.set_password(password)
    reset.used_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Password updated successfully"})

@app.route("/api/users", methods=["GET"])
@jwt_required()
def list_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role
        ,"task_count": len(u.tasks)
    } for u in users])

@app.route("/api/users/<int:user_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json(silent=True) or {}
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    if "password" in data:
        user.set_password(data["password"])
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name, "email": user.email, "role": user.role})

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})


# ---------------- TASK ROUTES ----------------
@app.route("/api/tasks", methods=["POST"])
@jwt_required()
def create_task():
    data = request.get_json(silent=True) or {}
    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400
    if data.get("user_id") is not None and not db.session.get(User, data["user_id"]):
        return jsonify({"error": "user_id does not exist"}), 400
    scheduled_date = None
    if data.get("scheduled_date"):
        try:
            scheduled_date = datetime.strptime(data["scheduled_date"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

    task = Task(
        title=data["title"],
        description=data.get("description"),
        location=data.get("location"),
        scheduled_date=scheduled_date,
        weather_sensitive=data.get("weather_sensitive", False),
        user_id=data.get("user_id"),
        status=data.get("status", "pending")
    )
    db.session.add(task)
    db.session.commit()

    return jsonify({
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "location": task.location,
        "scheduled_date": str(task.scheduled_date) if task.scheduled_date else None,
        "weather_sensitive": task.weather_sensitive,
        "status": task.status,
        "user_id": task.user_id,
        "user_name": task.user.name if task.user else None
    }), 201

@app.route("/api/tasks", methods=["GET"])
@jwt_required()
def list_tasks():
    tasks = Task.query.all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "location": t.location,
        "scheduled_date": str(t.scheduled_date) if t.scheduled_date else None,
        "weather_sensitive": t.weather_sensitive,
        "status": t.status,
        "user_id": t.user_id,
        "user_name": t.user.name if t.user else None
    } for t in tasks])

@app.route("/api/tasks/<int:task_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_task(task_id):
    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": "Task not found"}), 404
    data = request.get_json(silent=True) or {}
    if "scheduled_date" in data:
        try:
            task.scheduled_date = datetime.strptime(data["scheduled_date"], "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid date format"}), 400
    if "user_id" in data and data["user_id"] is not None and not db.session.get(User, data["user_id"]):
        return jsonify({"error": "user_id does not exist"}), 400
    for field in ["title", "description", "location", "status", "weather_sensitive", "user_id"]:
        if field in data:
            setattr(task, field, data[field])
    db.session.commit()
    return jsonify({"id": task.id, "title": task.title, "status": task.status})

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
