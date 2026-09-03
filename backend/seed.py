from datetime import date
from app import app, db, User, Task


def get_or_create_user(name, email, role):
    user = User.query.filter_by(email=email).first()
    if user:
        return user

    user = User(name=name, email=email, role=role)
    user.set_password("demo-password")
    db.session.add(user)
    db.session.flush()
    return user


def seed():
    foreman = get_or_create_user("Amina Otieno", "amina@example.com", "Foreman")
    manager = get_or_create_user("David Kamau", "david@example.com", "Site manager")

    demo_tasks = [
        ("Concrete pour", "Nairobi", date(2026, 9, 4), True, foreman.id),
        ("Roof inspection", "Nakuru", date(2026, 9, 5), True, foreman.id),
        ("Material inspection", "Nairobi", date(2026, 9, 6), False, manager.id),
    ]
    created = 0
    for title, location, scheduled_date, weather_sensitive, user_id in demo_tasks:
        exists = Task.query.filter_by(title=title, location=location).first()
        if not exists:
            db.session.add(Task(
                title=title,
                location=location,
                scheduled_date=scheduled_date,
                weather_sensitive=weather_sensitive,
                user_id=user_id,
            ))
            created += 1

    db.session.commit()
    print(f"Seed complete: {created} task(s) added")


if __name__ == "__main__":
    with app.app_context():
        seed()