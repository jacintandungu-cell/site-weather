from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///siteweather.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get(
    "SECRET_KEY", "siteweather-development-secret-key-change-me"
)
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", app.config['SECRET_KEY'])

db = SQLAlchemy(app)
Migrate(app, db)
JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})


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
