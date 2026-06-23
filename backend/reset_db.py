"""Drop ALL tables (including leftover ones) with CASCADE and recreate."""
from sqlalchemy import text
from app.database import engine, Base
from app.models import *  # noqa: F401,F403

print("Dropping all tables with CASCADE...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE"))
    conn.execute(text("CREATE SCHEMA public"))
    conn.commit()

print("Creating all tables with new schema...")
Base.metadata.create_all(bind=engine)
print("Done. Now run: python seed.py")
