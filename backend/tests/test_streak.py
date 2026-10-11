from datetime import date, datetime, timedelta

from app.database.base import utcnow

from app.models import HydrationLog, MealConsumption
from app.services.activity_service import compute_streaks
from tests.conftest import day_str, db_session, make_user, PROFILE, today_utc

D = date(2026, 3, 10)


def days(*offsets):
    return {D + timedelta(days=o) for o in offsets}


# ---- pure streak maths -------------------------------------------------------------------------
def test_no_activity():
    assert compute_streaks(set(), D) == (0, 0)


def test_streak_including_today():
    assert compute_streaks(days(0, -1, -2), D) == (3, 3)


def test_streak_alive_when_today_has_no_activity_yet():
    assert compute_streaks(days(-1, -2, -3), D) == (3, 3)


def test_streak_broken_after_a_missed_day():
    assert compute_streaks(days(-2, -3, -4), D) == (0, 3)


def test_longest_can_exceed_current():
    assert compute_streaks(days(0, -1, -5, -6, -7, -8), D) == (2, 4)


def test_single_gap_resets_current_but_keeps_longest():
    assert compute_streaks(days(0, -2, -3, -4), D) == (1, 3)


def test_future_dates_are_ignored():
    assert compute_streaks(days(1, 2, 3), D) == (0, 0)


def test_only_today():
    assert compute_streaks(days(0), D) == (1, 1)


# ---- endpoint, real records ----------------------------------------------------------------------
def add_meal(db, user_id, d):
    db.add(MealConsumption(user_id=user_id, consumed_on=d, meal_type="lunch", food_name="x", serving_size="1", portion=1,
                           calories=100, protein=1, carbs=1, fat=1))


def me(client, h):
    return client.get("/api/auth/me", headers=h).json()["id"]


def streak(client, h, tz=0, days_=14):
    r = client.get(f"/api/activity/streak?days={days_}&tz_offset={tz}", headers=h)
    assert r.status_code == 200, r.text
    return r.json()


def test_new_user_has_empty_state(client, onboarded):
    s = streak(client, onboarded)
    assert s["current_streak"] == 0 and s["longest_streak"] == 0 and s["active_days"] == 0 and s["total_active_days"] == 0
    assert len(s["days"]) == 14 and not any(d["active"] for d in s["days"])
    assert s["days"][-1]["date"] == s["today"] == day_str() and s["rule"]


def test_meals_and_water_both_count_once_per_day(client, onboarded):
    db, uid, t = db_session(client), me(client, onboarded), today_utc()
    for _ in range(3):
        add_meal(db, uid, t)                       # three meals today
    for _ in range(2):
        db.add(HydrationLog(user_id=uid, amount_ml=250, logged_at=utcnow()))  # + two water entries today
    add_meal(db, uid, t - timedelta(days=1))       # one meal yesterday
    db.add(HydrationLog(user_id=uid, amount_ml=500, logged_at=utcnow() - timedelta(days=2)))  # water only, 2 days ago
    db.commit()

    s = streak(client, onboarded)
    assert s["current_streak"] == 3 and s["longest_streak"] == 3
    assert s["active_days"] == 3 and s["total_active_days"] == 3          # many entries, still 3 days
    today_cell = s["days"][-1]
    assert today_cell["active"] and today_cell["meals"] == 3 and today_cell["hydration"] == 2
    assert s["today_active"] is True


def test_streak_survives_when_today_is_empty(client, onboarded):
    db, uid, t = db_session(client), me(client, onboarded), today_utc()
    for n in (1, 2, 3):
        add_meal(db, uid, t - timedelta(days=n))
    db.commit()
    s = streak(client, onboarded)
    assert s["current_streak"] == 3 and s["today_active"] is False


def test_longest_streak_uses_history_older_than_the_window(client, onboarded):
    db, uid, t = db_session(client), me(client, onboarded), today_utc()
    for n in range(40, 50):                         # an old 10-day run, outside the 14-day window
        add_meal(db, uid, t - timedelta(days=n))
    add_meal(db, uid, t)
    db.commit()
    s = streak(client, onboarded)
    assert s["longest_streak"] == 10 and s["current_streak"] == 1
    assert s["active_days"] == 1 and s["total_active_days"] == 11


def test_undoing_the_only_meal_removes_the_active_day(client, onboarded):
    item = client.post("/api/meal-planner/generate", json={"date": day_str()}, headers=onboarded).json()["items"][0]
    cid = client.post("/api/meal-consumptions", json={"meal_plan_item_id": item["id"]}, headers=onboarded).json()["id"]
    assert streak(client, onboarded)["current_streak"] == 1
    client.delete(f"/api/meal-consumptions/{cid}", headers=onboarded)
    assert streak(client, onboarded)["current_streak"] == 0


def test_timezone_decides_which_local_day_an_entry_belongs_to(client, onboarded):
    """Fixed timestamps, so the result never depends on when the test runs.
    tz_offset follows JS getTimezoneOffset(): UTC minus local, so India (UTC+5:30) is -330, New York (UTC-5) is +300."""
    from app.services.activity_service import activity_by_day

    db, uid = db_session(client), me(client, onboarded)
    db.add(HydrationLog(user_id=uid, amount_ml=250, logged_at=datetime(2026, 3, 10, 23, 30)))  # late evening UTC
    db.add(HydrationLog(user_id=uid, amount_ml=250, logged_at=datetime(2026, 3, 11, 0, 30)))   # just after UTC midnight
    db.commit()

    def local_days(tz):
        return sorted((d.isoformat(), c["hydration"]) for d, c in activity_by_day(db, uid, tz).items())

    assert local_days(0) == [("2026-03-10", 1), ("2026-03-11", 1)]       # UTC: one entry per day
    assert local_days(-330) == [("2026-03-11", 2)]                        # India: both entries fall on the 11th
    assert local_days(300) == [("2026-03-10", 2)]                         # New York: 18:30 and 19:30 on the 10th
    assert local_days(-840) == [("2026-03-11", 2)]                        # UTC+14: 13:30 and 14:30 on the 11th


def test_endpoint_applies_the_offset_to_today(client, onboarded):
    from app.services.timeutil import local_today
    for tz in (-840, -330, 0, 300, 840):
        assert streak(client, onboarded, tz=tz)["today"] == local_today(tz).isoformat()


def test_far_east_and_far_west_offsets_are_accepted_and_bounded(client, onboarded):
    assert client.get("/api/activity/streak?tz_offset=-840", headers=onboarded).status_code == 200
    assert client.get("/api/activity/streak?tz_offset=840", headers=onboarded).status_code == 200
    assert client.get("/api/activity/streak?tz_offset=9999", headers=onboarded).status_code == 422
    assert client.get("/api/activity/streak?days=3", headers=onboarded).status_code == 422
    assert client.get("/api/activity/streak?days=1000", headers=onboarded).status_code == 422


def test_streaks_are_per_user(client):
    a = make_user(client, "Asha", "asha@example.com")
    b = make_user(client, "Ben", "ben@example.com")
    for h in (a, b):
        client.post("/api/profile", json=PROFILE, headers=h)
    db = db_session(client)
    for n in range(5):
        add_meal(db, me(client, a), today_utc() - timedelta(days=n))
    db.commit()
    assert streak(client, a)["current_streak"] == 5
    assert streak(client, b)["current_streak"] == 0 and streak(client, b)["total_active_days"] == 0


def test_requires_login_and_profile(client, auth):
    assert client.get("/api/activity/streak").status_code == 401
    assert client.get("/api/activity/streak", headers=auth).status_code == 400
