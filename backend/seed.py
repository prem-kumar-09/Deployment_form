from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.database import SessionLocal, engine, Base
from app.models import User, UserRole


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                email="admin@example.com",
                name="Admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print("Default admin created: admin@example.com / admin123")

        print("Database seeded successfully.")
        print("Login at http://localhost:3000/login with admin@example.com / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
