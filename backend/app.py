from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://siteweather_user:mypassword@localhost/siteweather"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "dev_secret_key")

db = SQLAlchemy(app)


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

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)


with app.app_context():
    db.create_all()


@app.route("/")
def index():
    return jsonify({"message": "SiteWeather API running"})


# ---------------- USER ROUTES ----------------
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = User(name=data["name"], email=data["email"], role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully", "id": user.id}), 201

@app.route("/api/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role
    } for u in users])

@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)
    db.session.commit()
    return jsonify({"message": "User updated"})

@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})


# ---------------- TASK ROUTES ----------------
@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
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

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.status = data.get("status", task.status)
    task.user_id = data.get("user_id", task.user_id)
    db.session.commit()
    return jsonify({"message": "Task updated"})

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
