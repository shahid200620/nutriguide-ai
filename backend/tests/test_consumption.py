from sqlalchemy import func, select

from app.models import MealConsumption
from tests.conftest import day_str, db_session, make_user, PROFILE


def plan(client, headers, d=None):
    r = client.post("/api/meal-planner/generate", json={"date": d or day_str()}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def consume(client, headers, item_id, portion=None):
    body = {"meal_plan_item_id": item_id}
    if portion is not None:
        body["portion"] = portion
    return client.post("/api/meal-consumptions", json=body, headers=headers)


def summary(client, headers, d=None):
    return client.get(f"/api/nutrition/summary?date={d or day_str()}", headers=headers).json()


def test_nothing_consumed_by_default(client, onboarded):
    plan(client, onboarded)
    s = summary(client, onboarded)
    t = s["targets"]["daily_calorie_target"]
    assert s["calories"]["consumed"] == 0 and s["calories"]["remaining"] == t
    assert s["consumed"] == {"calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "meals": 0}


def test_consume_updates_totals_from_records(client, onboarded):
    p = plan(client, onboarded)
    a, b = p["items"][0], p["items"][1]
    r = consume(client, onboarded, a["id"])
    assert r.status_code == 201
    rec = r.json()
    assert rec["calories"] == a["calories"] and rec["protein"] == a["protein"] and rec["portion"] == 1.0
    assert rec["food_name"] == a["food_name"] and rec["consumed_at"].endswith("Z")

    consume(client, onboarded, b["id"])
    s = summary(client, onboarded)
    t = s["targets"]["daily_calorie_target"]
    expected = round(a["calories"] + b["calories"])
    assert s["calories"]["consumed"] == expected
    assert s["calories"]["remaining"] == t - expected          # remaining = target - consumed
    assert s["consumed"]["protein"] == round(a["protein"] + b["protein"], 1)
    assert s["consumed"]["carbs"] == round(a["carbs"] + b["carbs"], 1)
    assert s["consumed"]["fat"] == round(a["fat"] + b["fat"], 1)
    assert s["consumed"]["meals"] == 2


def test_plan_items_expose_their_consumption_state(client, onboarded):
    p = plan(client, onboarded)
    consume(client, onboarded, p["items"][0]["id"])
    items = client.get(f"/api/meal-planner?date={day_str()}", headers=onboarded).json()[0]["items"]
    assert items[0]["consumption"]["id"] and all(i["consumption"] is None for i in items[1:])


def test_repeated_consume_is_idempotent(client, onboarded):
    item = plan(client, onboarded)["items"][0]
    first = consume(client, onboarded, item["id"])
    again = [consume(client, onboarded, item["id"]) for _ in range(4)]
    assert first.status_code == 201 and all(r.status_code == 200 for r in again)
    assert {r.json()["id"] for r in again} == {first.json()["id"]}
    assert db_session(client).scalar(select(func.count(MealConsumption.id))) == 1
    assert summary(client, onboarded)["calories"]["consumed"] == round(item["calories"])


def test_database_rejects_a_second_record_for_the_same_item(client, onboarded):
    """The unique constraint is the real guard against two simultaneous requests."""
    import pytest
    from sqlalchemy.exc import IntegrityError

    item = plan(client, onboarded)["items"][0]
    consume(client, onboarded, item["id"])
    db = db_session(client)
    existing = db.scalar(select(MealConsumption))
    dup = MealConsumption(user_id=existing.user_id, meal_plan_item_id=item["id"], consumed_on=existing.consumed_on,
                          meal_type=existing.meal_type, food_name="x", serving_size="x", portion=1, calories=1, protein=1, carbs=1, fat=1)
    db.add(dup)
    with pytest.raises(IntegrityError):
        db.commit()


def test_partial_portion_scales_nutrition(client, onboarded):
    item = plan(client, onboarded)["items"][0]
    rec = consume(client, onboarded, item["id"], portion=0.5).json()
    assert rec["portion"] == 0.5
    assert rec["calories"] == round(item["calories"] * 0.5, 1)
    assert rec["protein"] == round(item["protein"] * 0.5, 1)
    assert summary(client, onboarded)["calories"]["consumed"] == round(item["calories"] * 0.5)


def test_invalid_portions_rejected(client, onboarded):
    item = plan(client, onboarded)["items"][0]
    for bad in (0, -1, 0.1, 0.3, 5):
        assert consume(client, onboarded, item["id"], portion=bad).status_code == 422
    assert db_session(client).scalar(select(func.count(MealConsumption.id))) == 0


def test_undo_restores_totals_and_allows_consuming_again(client, onboarded):
    item = plan(client, onboarded)["items"][0]
    cid = consume(client, onboarded, item["id"]).json()["id"]
    assert client.delete(f"/api/meal-consumptions/{cid}", headers=onboarded).status_code == 204
    s = summary(client, onboarded)
    assert s["calories"]["consumed"] == 0 and s["consumed"]["meals"] == 0
    assert client.delete(f"/api/meal-consumptions/{cid}", headers=onboarded).status_code == 404  # already gone
    assert consume(client, onboarded, item["id"]).status_code == 201                              # can be redone


def test_cannot_consume_future_meals(client, onboarded):
    item = plan(client, onboarded, day_str(1))["items"][0]
    r = consume(client, onboarded, item["id"])
    assert r.status_code == 400 and "today or earlier" in r.json()["detail"]
    assert db_session(client).scalar(select(func.count(MealConsumption.id))) == 0


def test_past_day_meals_count_for_that_day_only(client, onboarded):
    yesterday = day_str(-1)
    item = plan(client, onboarded, yesterday)["items"][0]
    assert consume(client, onboarded, item["id"]).json()["consumed_on"] == yesterday
    assert summary(client, onboarded, yesterday)["calories"]["consumed"] == round(item["calories"])
    assert summary(client, onboarded, day_str())["calories"]["consumed"] == 0


def test_over_target_gives_negative_remaining(client, onboarded):
    p = plan(client, onboarded)
    for i in p["items"]:
        consume(client, onboarded, i["id"], portion=3.0)
    s = summary(client, onboarded)
    assert s["calories"]["consumed"] > s["calories"]["target"]
    assert s["calories"]["remaining"] == s["calories"]["target"] - s["calories"]["consumed"] < 0


def test_day_endpoint_lists_entries_and_totals(client, onboarded):
    p = plan(client, onboarded)
    consume(client, onboarded, p["items"][0]["id"])
    consume(client, onboarded, p["items"][1]["id"])
    d = client.get(f"/api/meal-consumptions?date={day_str()}", headers=onboarded).json()
    assert len(d["entries"]) == 2 and d["totals"]["meals"] == 2


def test_regenerating_the_plan_keeps_what_you_ate(client, onboarded):
    item = plan(client, onboarded)["items"][0]
    consume(client, onboarded, item["id"])
    plan(client, onboarded)  # regenerate: old items are deleted
    d = client.get(f"/api/meal-consumptions?date={day_str()}", headers=onboarded).json()
    assert d["totals"]["calories"] == round(item["calories"])
    assert d["entries"][0]["meal_plan_item_id"] is None          # detached, snapshot preserved
    assert d["entries"][0]["food_name"] == item["food_name"]
    # ...and it can be removed from the log explicitly
    assert client.delete(f"/api/meal-consumptions/{d['entries'][0]['id']}", headers=onboarded).status_code == 204


def test_requires_login_and_profile(client, auth):
    assert client.post("/api/meal-consumptions", json={"meal_plan_item_id": 1}).status_code == 401
    assert client.get("/api/meal-consumptions").status_code == 401
    assert client.post("/api/meal-consumptions", json={"meal_plan_item_id": 1}, headers=auth).status_code == 400  # no profile yet


def test_unknown_item_is_404(client, onboarded):
    assert consume(client, onboarded, 999999).status_code == 404


# ---- isolation between users ------------------------------------------------------------------
def _two(client):
    a = make_user(client, "Asha", "asha@example.com")
    b = make_user(client, "Ben", "ben@example.com")
    for h in (a, b):
        client.post("/api/profile", json=PROFILE, headers=h)
    return a, b


def test_cannot_consume_another_users_meal(client):
    a, b = _two(client)
    item = plan(client, a)["items"][0]
    assert consume(client, b, item["id"]).status_code == 404
    assert db_session(client).scalar(select(func.count(MealConsumption.id))) == 0


def test_cannot_undo_or_see_another_users_consumption(client):
    a, b = _two(client)
    item = plan(client, a)["items"][0]
    cid = consume(client, a, item["id"]).json()["id"]
    assert client.delete(f"/api/meal-consumptions/{cid}", headers=b).status_code == 404
    assert client.get(f"/api/meal-consumptions?date={day_str()}", headers=b).json()["entries"] == []
    assert summary(client, b)["calories"]["consumed"] == 0
    assert summary(client, a)["calories"]["consumed"] == round(item["calories"])  # untouched by B's attempts
