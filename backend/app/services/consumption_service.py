"""Consumed-nutrition maths. All totals come from meal_consumptions rows - never from the plan."""
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import MealConsumption, MealPlanItem

PORTION_STEP = 0.25


def scale_item(item: MealPlanItem, portion: float) -> dict[str, float]:
    """Nutrition for `portion` x the planned serving."""
    return {k: round(getattr(item, k) * portion, 1) for k in ("calories", "protein", "carbs", "fat")}


def consumed_totals(db: Session, user_id: int, day: date) -> dict:
    row = db.execute(
        select(
            func.coalesce(func.sum(MealConsumption.calories), 0.0),
            func.coalesce(func.sum(MealConsumption.protein), 0.0),
            func.coalesce(func.sum(MealConsumption.carbs), 0.0),
            func.coalesce(func.sum(MealConsumption.fat), 0.0),
            func.count(MealConsumption.id),
        ).where(MealConsumption.user_id == user_id, MealConsumption.consumed_on == day)
    ).one()
    return {
        "calories": int(round(row[0])),
        "protein": round(row[1], 1),
        "carbs": round(row[2], 1),
        "fat": round(row[3], 1),
        "meals": int(row[4]),
    }


def day_entries(db: Session, user_id: int, day: date) -> list[MealConsumption]:
    stmt = (
        select(MealConsumption)
        .where(MealConsumption.user_id == user_id, MealConsumption.consumed_on == day)
        .order_by(MealConsumption.consumed_at, MealConsumption.id)
    )
    return list(db.scalars(stmt))
