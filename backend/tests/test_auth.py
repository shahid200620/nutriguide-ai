from tests.conftest import make_user


def test_register_login_me(client):
    h = make_user(client)
    me = client.get("/api/auth/me", headers=h).json()
    assert me["email"] == "asha@example.com" and me["profile_complete"] is False
    r = client.post("/api/auth/login", json={"email": "ASHA@example.com", "password": "password123"})
    assert r.status_code == 200 and r.json()["access_token"]


def test_password_is_hashed(client):
    make_user(client)
    from app.models import User
    from app.main import app
    from app.database.session import get_db
    db = next(app.dependency_overrides[get_db]())
    assert db.query(User).one().password_hash != "password123"


def test_invalid_login_message(client):
    make_user(client)
    r = client.post("/api/auth/login", json={"email": "asha@example.com", "password": "wrong-password"})
    assert r.status_code == 401 and r.json()["detail"] == "Invalid email or password."


def test_duplicate_email_rejected(client):
    make_user(client)
    r = client.post("/api/auth/register", json={"name": "B", "email": "asha@example.com", "password": "password123", "confirm_password": "password123"})
    assert r.status_code == 409


def test_password_mismatch_and_short(client):
    base = {"name": "A", "email": "a@example.com"}
    assert client.post("/api/auth/register", json={**base, "password": "password123", "confirm_password": "other12345"}).status_code == 422
    assert client.post("/api/auth/register", json={**base, "password": "short", "confirm_password": "short"}).status_code == 422


def test_protected_routes_need_token(client):
    for path in ("/api/auth/me", "/api/profile", "/api/nutrition/summary", "/api/meal-planner", "/api/hydration/today"):
        assert client.get(path).status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer garbage"}).status_code == 401
