import os

# Must be set before the app is imported.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-secret-not-for-production"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
import app.models as _models  # noqa: F401  (registers tables; aliased so it can't shadow `app` above)


@pytest.fixture()
def client():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False)

    def override():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


PROFILE = {
    "age": 25, "gender": "male", "height_cm": 175, "weight_kg": 70,
    "activity_level": "sedentary", "dietary_preference": "vegetarian", "fitness_goal": "maintenance",
}


def make_user(client, name="Asha", email="asha@example.com", password="password123"):
    r = client.post("/api/auth/register", json={"name": name, "email": email, "password": password, "confirm_password": password})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture()
def auth(client):
    return make_user(client)


@pytest.fixture()
def onboarded(client, auth):
    r = client.post("/api/profile", json=PROFILE, headers=auth)
    assert r.status_code == 201, r.text
    return auth


# ---- helpers shared by consumption / streak tests -------------------------------------------
from datetime import date, timedelta  # noqa: E402


def db_session(client):
    """A SQLAlchemy session on the same in-memory DB the test client uses (for arranging rows directly)."""
    return next(app.dependency_overrides[get_db]())


def today_utc() -> date:
    from app.services.timeutil import local_today
    return local_today(0)


def day_str(offset_days: int = 0) -> str:
    return (today_utc() + timedelta(days=offset_days)).isoformat()
