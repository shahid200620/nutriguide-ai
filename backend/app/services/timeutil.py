"""Helpers for 'today' in the user's local time.

The browser sends tz_offset = Date.getTimezoneOffset() (minutes, UTC minus local).
Timestamps are stored as naive UTC.
"""
from datetime import date, datetime, timedelta

from app.database.base import utcnow


def local_day_bounds_utc(tz_offset_minutes: int = 0, now: datetime | None = None) -> tuple[datetime, datetime]:
    now = now or utcnow()
    local_now = now - timedelta(minutes=tz_offset_minutes)
    local_midnight = datetime(local_now.year, local_now.month, local_now.day)
    start_utc = local_midnight + timedelta(minutes=tz_offset_minutes)
    return start_utc, start_utc + timedelta(days=1)


def local_today(tz_offset_minutes: int = 0) -> date:
    return (utcnow() - timedelta(minutes=tz_offset_minutes)).date()
