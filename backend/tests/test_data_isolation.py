from tests.conftest import PROFILE, make_user


def two_users(client):
    a = make_user(client, "Asha", "asha@example.com")
    b = make_user(client, "Ben", "ben@example.com")
    for h in (a, b):
        client.post("/api/profile", json=PROFILE, headers=h)
    return a, b


def test_hydration_isolated(client):
    a, b = two_users(client)
    log = client.post("/api/hydration", json={"amount_ml": 500}, headers=a).json()
    assert client.get("/api/hydration/today", headers=b).json()["consumed_ml"] == 0
    assert client.delete(f"/api/hydration/{log['id']}", headers=b).status_code == 404
    assert client.get("/api/hydration/today", headers=a).json()["consumed_ml"] == 500


def test_meal_plans_isolated(client):
    a, b = two_users(client)
    pid = client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=a).json()["id"]
    assert client.get(f"/api/meal-planner/{pid}", headers=b).status_code == 404
    assert client.delete(f"/api/meal-planner/{pid}", headers=b).status_code == 404
    assert client.get("/api/meal-planner", headers=b).json() == []
    assert client.get(f"/api/meal-planner/{pid}", headers=a).status_code == 200


def test_profiles_isolated(client):
    a, b = two_users(client)
    client.put("/api/profile", json={**PROFILE, "weight_kg": 90}, headers=a)
    assert client.get("/api/profile", headers=b).json()["weight_kg"] == 70
