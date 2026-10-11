from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_profile
from app.database.session import get_db
from app.models import MealPlan, User
from app.schemas.nutrition import NutritionSummary, NutritionTargetsOut
from app.services.consumption_service import consumed_totals
from app.services.hydration_service import hydration_status
from app.services.profile_service import recalculate_targets, targets_out_dict
from app.services.timeutil import local_today
from datetime import date

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.post("/calculate", response_model=NutritionTargetsOut)
def calculate(ctx=Depends(require_profile), db: Session = Depends(get_db)):
    """Recompute and store targets from the saved profile."""
    user, _, _ = ctx
    t = recalculate_targets(db, user)
    db.commit()
    db.refresh(t)
    return targets_out_dict(t)


@router.get("/summary", response_model=NutritionSummary)
def summary(
    date_: date | None = Query(default=None, alias="date"),
    tz_offset: int = Query(default=0, ge=-840, le=840),
    ctx=Depends(require_profile),
    db: Session = Depends(get_db),
):
    user, profile, targets = ctx
    day = date_ or local_today(tz_offset)
    plan = db.scalar(select(MealPlan).where(MealPlan.user_id == user.id, MealPlan.date == day))
    hydration, _ = hydration_status(db, user.id, profile.weight_kg, tz_offset)
    totals = consumed_totals(db, user.id, day)  # real records, not the plan
    consumed = totals["calories"]
    return {
        "user_name": user.name,
        "profile": profile,
        "targets": targets_out_dict(targets),
        "calories": {
            "target": targets.daily_calorie_target,
            "consumed": consumed,
            "remaining": targets.daily_calorie_target - consumed,
            "food_logging_available": True,
        },
        "consumed": totals,
        "hydration": hydration,
        "meal_plan": plan,
    }
