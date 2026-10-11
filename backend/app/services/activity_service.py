"""
Streak / consistency maths.

Rule (single definition, used everywhere):
  A calendar day is ACTIVE when the user has at least one meal marked as consumed on it
  OR at least one hydration entry on it. Many entries on one day still count as ONE active day.

Which calendar? The user's local one. The browser sends tz_offset (minutes, UTC minus local,
exactly like every other endpoint here). Hydration timestamps (UTC) are shifted into local dates;
meal consumptions already store their local date.
Limitation: one fixed offset is applied to the whole history, so entries logged on the other side
of a daylight-saving change can land on a neighbouring day.

Streak:
  current  = consecutive active days ending today. If today has no activity YET but yesterday had,
             the streak is still alive (the user has until the end of today), so it counts back
             from yesterday. If neither is active it is 0.
  longest  = longest run of consecutive active days in the user's whole history.
"""
from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import HydrationLog, MealConsumption
from app.services.timeutil import local_today

STREAK_RULE = (
    "A day counts when you mark at least one meal as consumed or log water. "
    "Several entries on the same day count once. Days follow your device's local time. "
    "Your streak stays alive until the end of today, so you can still keep it going."
)


def compute_streaks(active: set[date], today: date) -> tuple[int, int]:
    """Return (current_streak, longest_streak). Dates after `today` are ignored."""
    days = sorted(d for d in active if d <= today)
    longest = run = 0
    prev: date | None = None
    for d in days:
        run = run + 1 if prev is not None and d - prev == timedelta(days=1) else 1
        longest = max(longest, run)
        prev = d

    day_set = set(days)
    cursor = today if today in day_set else today - timedelta(days=1)
    current = 0
    while cursor in day_set:
        current += 1
        cursor -= timedelta(days=1)
    return current, longest


def activity_by_day(db: Session, user_id: int, tz_offset: int) -> dict[date, dict[str, int]]:
    """{local date: {"meals": n, "hydration": n}} for the user's whole history, in two queries."""
    out: dict[date, dict[str, int]] = defaultdict(lambda: {"meals": 0, "hydration": 0})

    meal_rows = db.execute(
        select(MealConsumption.consumed_on, func.count(MealConsumption.id))
        .where(MealConsumption.user_id == user_id)
        .group_by(MealConsumption.consumed_on)
    )
    for day, n in meal_rows:
        out[day]["meals"] += n

    for (logged_at,) in db.execute(select(HydrationLog.logged_at).where(HydrationLog.user_id == user_id)):
        out[(logged_at - timedelta(minutes=tz_offset)).date()]["hydration"] += 1
    return out


def streak_report(db: Session, user_id: int, tz_offset: int, window_days: int) -> dict:
    today = local_today(tz_offset)
    by_day = {d: c for d, c in activity_by_day(db, user_id, tz_offset).items() if d <= today}
    active = set(by_day)
    current, longest = compute_streaks(active, today)

    days = []
    for i in range(window_days - 1, -1, -1):
        d = today - timedelta(days=i)
        c = by_day.get(d, {"meals": 0, "hydration": 0})
        days.append({"date": d, "active": d in active, "meals": c["meals"], "hydration": c["hydration"]})

    return {
        "today": today,
        "rule": STREAK_RULE,
        "current_streak": current,
        "longest_streak": longest,
        "today_active": today in active,
        "window_days": window_days,
        "active_days": sum(1 for d in days if d["active"]),
        "total_active_days": len(active),
        "days": days,
    }
