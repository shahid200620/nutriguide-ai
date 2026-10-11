from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import require_profile
from app.database.session import get_db
from app.models import MealPlan, MealPlanItem
from app.schemas.meal_plan import GenerateMealPlanRequest, MealPlanOut
from app.services.meal_planner import generate_plan
from app.services.timeutil import local_today

router = APIRouter(prefix="/api/meal-planner", tags=["meal-planner"])


def _owned_plan(db: Session, user_id: int, plan_id: int) -> MealPlan:
    plan = db.scalar(select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == user_id))
    if plan is None:  # same answer for "missing" and "someone else's" - no information leak
        raise HTTPException(status_code=404, detail="Meal plan not found.")
    return plan


@router.get("", response_model=list[MealPlanOut])
def list_plans(date_: date | None = Query(default=None, alias="date"), ctx=Depends(require_profile), db: Session = Depends(get_db)):
    user, _, _ = ctx
    stmt = select(MealPlan).where(MealPlan.user_id == user.id).order_by(MealPlan.date.desc(), MealPlan.id.desc())
    if date_:
        stmt = stmt.where(MealPlan.date == date_)
    return list(db.scalars(stmt.limit(30)))


@router.post("/generate", response_model=MealPlanOut, status_code=status.HTTP_201_CREATED)
def generate(body: GenerateMealPlanRequest, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    """Generate (or regenerate) the rule-based plan for a date, replacing any existing plan for it."""
    user, profile, targets = ctx
    day = body.date or local_today(0)
    try:
        items = generate_plan(targets.daily_calorie_target, profile.dietary_preference)
        existing = db.scalar(select(MealPlan).where(MealPlan.user_id == user.id, MealPlan.date == day))
        if existing:
            db.delete(existing)
            db.flush()
        plan = MealPlan(user_id=user.id, date=day, daily_calorie_target=targets.daily_calorie_target)
        plan.items = [MealPlanItem(**vars(i)) for i in items]
        db.add(plan)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to generate your meal plan.")
    db.refresh(plan)
    return plan


@router.get("/{plan_id}", response_model=MealPlanOut)
def get_plan(plan_id: int, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    return _owned_plan(db, ctx[0].id, plan_id)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    db.delete(_owned_plan(db, ctx[0].id, plan_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
