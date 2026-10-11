from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import require_profile
from app.database.session import get_db
from app.models import MealConsumption, MealPlan, MealPlanItem
from app.schemas.consumption import ConsumeIn, ConsumptionOut, DayConsumption
from app.services.consumption_service import consumed_totals, day_entries, scale_item
from app.services.timeutil import local_today

router = APIRouter(prefix="/api/meal-consumptions", tags=["meal-consumptions"])

TZ = Query(default=0, ge=-840, le=840)


@router.get("", response_model=DayConsumption)
def for_day(
    date_: date | None = Query(default=None, alias="date"),
    tz_offset: int = TZ,
    ctx=Depends(require_profile),
    db: Session = Depends(get_db),
):
    """Everything the user marked as consumed on one local day, plus the totals."""
    user, _, _ = ctx
    day = date_ or local_today(tz_offset)
    return {"date": day, "entries": day_entries(db, user.id, day), "totals": consumed_totals(db, user.id, day)}


@router.post("", response_model=ConsumptionOut, status_code=status.HTTP_201_CREATED)
def consume(body: ConsumeIn, response: Response, tz_offset: int = TZ, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    """Mark one planned meal item as consumed.

    Safe to repeat: if the item is already consumed the existing record is returned with 200
    and nothing new is written (the DB unique constraint also protects against two simultaneous requests).
    """
    user, _, _ = ctx

    # Ownership is enforced in the query: the item must belong to a plan owned by this user.
    row = db.execute(
        select(MealPlanItem, MealPlan.date)
        .join(MealPlan, MealPlan.id == MealPlanItem.meal_plan_id)
        .where(MealPlanItem.id == body.meal_plan_item_id, MealPlan.user_id == user.id)
    ).first()
    if row is None:  # same answer for "missing" and "someone else's"
        raise HTTPException(status_code=404, detail="Planned meal not found.")
    item, plan_day = row

    existing = db.scalar(select(MealConsumption).where(MealConsumption.meal_plan_item_id == item.id))
    if existing is not None:
        response.status_code = status.HTTP_200_OK
        return existing

    if plan_day > local_today(tz_offset):
        raise HTTPException(status_code=400, detail="You can only mark meals as consumed for today or earlier days.")

    record = MealConsumption(
        user_id=user.id,
        meal_plan_item_id=item.id,
        consumed_on=plan_day,
        meal_type=item.meal_type,
        food_name=item.food_name,
        serving_size=item.serving_size,
        portion=body.portion,
        **scale_item(item, body.portion),
    )
    try:
        db.add(record)
        db.commit()
    except IntegrityError:
        # Lost a race with a simultaneous identical request: return the winner's record.
        db.rollback()
        winner = db.scalar(select(MealConsumption).where(MealConsumption.meal_plan_item_id == item.id))
        if winner is None:
            raise HTTPException(status_code=500, detail="Unable to save this meal.")
        response.status_code = status.HTTP_200_OK
        return winner
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to save this meal.")
    db.refresh(record)
    return record


@router.delete("/{consumption_id}", status_code=status.HTTP_204_NO_CONTENT)
def undo(consumption_id: int, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    """Undo a consumption (marked by mistake). Totals and streaks recalculate from the remaining records."""
    record = db.scalar(select(MealConsumption).where(MealConsumption.id == consumption_id, MealConsumption.user_id == ctx[0].id))
    if record is None:
        raise HTTPException(status_code=404, detail="Consumption record not found.")
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
