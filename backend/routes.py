from flask import Blueprint, request, jsonify
from models import db, User, Task

api = Blueprint("api", __name__)

@api.route("/users", methods=["POST"])
def create_user():
    data = request.json
    user = User(name=data["name"], email=data["email"], role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "email": user.email}), 201



@api.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    task = Task(
        title=data["title"],
        description=data.get("description"),
        location=data.get("location"),
        scheduled_date=data["scheduled_date"],
        status=data.get("status", "pending"),
        weather_sensitive=data.get("weather_sensitive", False),
        user_id=data["user_id"]
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"id": task.id, "title": task.title}), 201


@api.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "status": t.status,
        "weather_sensitive": t.weather_sensitive
    } for t in tasks])


@api.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.json
    for field in ["title", "description", "location", "scheduled_date", "status", "weather_sensitive"]:
        if field in data:
            setattr(task, field, data[field])
    db.session.commit()
    return jsonify({"message": "Task updated"})


@api.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})
