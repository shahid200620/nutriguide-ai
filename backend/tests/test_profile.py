import pytest

from tests.conftest import PROFILE


def test_profile_missing_before_onboarding(client, auth):
    assert client.get("/api/profile", headers=auth).status_code == 404
    r = client.get("/api/nutrition/summary", headers=auth)
    assert r.status_code == 400 and r.json()["detail"] == "Please complete your profile."


def test_create_profile_calculates_and_stores_targets(client, auth):
    assert client.post("/api/profile", json={**PROFILE, "fitness_goal": "fat_loss"}, headers=auth).status_code == 201
    assert client.get("/api/auth/me", headers=auth).json()["profile_complete"] is True
    s = client.get("/api/nutrition/summary", headers=auth).json()
    assert s["targets"]["bmi_category"] == "Normal"
    assert s["targets"]["daily_calorie_target"] == 1609   # TDEE 2008.6 - 400
    assert s["calories"]["consumed"] == 0 and s["calories"]["food_logging_available"] is True  # meal logging now exists
    assert s["meal_plan"] is None


def test_update_profile_recalculates(client, onboarded):
    before = client.get("/api/nutrition/summary", headers=onboarded).json()["targets"]["daily_calorie_target"]
    r = client.put("/api/profile", json={**PROFILE, "fitness_goal": "muscle_gain"}, headers=onboarded)
    assert r.status_code == 200
    after = client.get("/api/nutrition/summary", headers=onboarded).json()["targets"]["daily_calorie_target"]
    assert after == before + 250


def test_duplicate_create_conflicts(client, onboarded):
    assert client.post("/api/profile", json=PROFILE, headers=onboarded).status_code == 409


@pytest.mark.parametrize("field,value", [("age", 0), ("age", -5), ("height_cm", -170), ("height_cm", 0), ("weight_kg", -1), ("weight_kg", 0), ("gender", "x"), ("activity_level", "none")])
def test_invalid_profile_values_rejected(client, auth, field, value):
    assert client.post("/api/profile", json={**PROFILE, field: value}, headers=auth).status_code == 422


def test_missing_required_field_rejected(client, auth):
    body = dict(PROFILE)
    del body["age"]
    assert client.post("/api/profile", json=body, headers=auth).status_code == 422


def test_recalculate_endpoint(client, onboarded):
    r = client.post("/api/nutrition/calculate", headers=onboarded)
    assert r.status_code == 200 and r.json()["daily_calorie_target"] == 2009
