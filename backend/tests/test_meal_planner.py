import random

from app.services.meal_planner import generate_plan
from app.services.food_catalog import DIET_ALLOWS, MEAL_TEMPLATES

MEALS = {"breakfast", "lunch", "snack", "dinner"}


def test_generate_stores_plan_close_to_target(client, onboarded):
    r = client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=onboarded)
    assert r.status_code == 201
    plan = r.json()
    assert {i["meal_type"] for i in plan["items"]} == MEALS
    assert abs(plan["total_calories"] - plan["daily_calorie_target"]) / plan["daily_calorie_target"] < 0.15
    assert plan["generator"] == "rule_based"


def test_regenerate_replaces_plan_for_same_date(client, onboarded):
    client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=onboarded)
    client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=onboarded)
    plans = client.get("/api/meal-planner?date=2026-01-15", headers=onboarded).json()
    assert len(plans) == 1


def test_summary_includes_plan_for_date(client, onboarded):
    client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=onboarded)
    s = client.get("/api/nutrition/summary?date=2026-01-15", headers=onboarded).json()
    assert s["meal_plan"] is not None


def test_get_and_delete_plan(client, onboarded):
    pid = client.post("/api/meal-planner/generate", json={"date": "2026-01-15"}, headers=onboarded).json()["id"]
    assert client.get(f"/api/meal-planner/{pid}", headers=onboarded).status_code == 200
    assert client.delete(f"/api/meal-planner/{pid}", headers=onboarded).status_code == 204
    assert client.get(f"/api/meal-planner/{pid}", headers=onboarded).status_code == 404


def test_requires_profile(client, auth):
    assert client.post("/api/meal-planner/generate", json={}, headers=auth).status_code == 400


def test_diet_rules_respected_for_every_diet():
    allowed_names = {
        diet: {f[0] for slots in MEAL_TEMPLATES.values() for slot in slots for f in slot if f[6] in tags}
        for diet, tags in DIET_ALLOWS.items()
    }
    for diet in DIET_ALLOWS:
        for seed in range(25):
            for item in generate_plan(1800, diet, random.Random(seed)):
                assert item.food_name in allowed_names[diet]


def test_vegan_plan_has_no_animal_products():
    vegan_only = {f[0] for slots in MEAL_TEMPLATES.values() for slot in slots for f in slot if f[6] == "vegan"}
    for seed in range(25):
        assert all(i.food_name in vegan_only for i in generate_plan(2200, "vegan", random.Random(seed)))
