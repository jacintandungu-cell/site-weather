from datetime import date
from app import app, db, User, Task


with app.app_context():
    if User.query.count() == 0:
        foreman = User(name="Amina Otieno", email="amina@example.com", role="Foreman")
        foreman.set_password("demo-password")
        manager = User(name="David Kamau", email="david@example.com", role="Site manager")
        manager.set_password("demo-password")
        db.session.add_all([foreman, manager])
        db.session.flush()
        db.session.add_all([
            Task(title="Concrete pour", location="Nairobi", scheduled_date=date(2026, 9, 4), weather_sensitive=True, user_id=foreman.id),
            Task(title="Material inspection", location="Nairobi", scheduled_date=date(2026, 9, 5), user_id=manager.id),
        ])
        db.session.commit()
        print("Seeded demo users and tasks")
    else:
        print("Users already exist; nothing seeded")