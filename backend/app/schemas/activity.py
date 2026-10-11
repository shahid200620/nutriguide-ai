from datetime import date as date_type

from pydantic import BaseModel


class ActivityDay(BaseModel):
    date: date_type
    active: bool
    meals: int
    hydration: int


class StreakOut(BaseModel):
    today: date_type
    rule: str
    current_streak: int
    longest_streak: int
    today_active: bool
    window_days: int
    active_days: int        # active days inside the returned window
    total_active_days: int  # all-time
    days: list[ActivityDay]  # oldest -> newest, last item is today
