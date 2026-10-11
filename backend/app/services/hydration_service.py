from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import HydrationLog
from app.services.nutrition import calculate_hydration_target_ml
from app.services.timeutil import local_day_bounds_utc


def todays_entries(db: Session, user_id: int, tz_offset: int) -> list[HydrationLog]:
    start, end = local_day_bounds_utc(tz_offset)
    stmt = (
        select(HydrationLog)
        .where(HydrationLog.user_id == user_id, HydrationLog.logged_at >= start, HydrationLog.logged_at < end)
        .order_by(HydrationLog.logged_at.desc(), HydrationLog.id.desc())
    )
    return list(db.scalars(stmt))


def hydration_status(db: Session, user_id: int, weight_kg: float, tz_offset: int) -> tuple[dict, list[HydrationLog]]:
    entries = todays_entries(db, user_id, tz_offset)
    consumed = sum(e.amount_ml for e in entries)
    target = calculate_hydration_target_ml(weight_kg)
    return {
        "target_ml": target,
        "consumed_ml": consumed,
        "remaining_ml": max(0, target - consumed),
        "percent": min(100, round(consumed / target * 100)) if target else 0,
        "is_estimate": True,
    }, entries
