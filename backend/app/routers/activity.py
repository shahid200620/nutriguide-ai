from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import require_profile
from app.database.session import get_db
from app.schemas.activity import StreakOut
from app.services.activity_service import streak_report

router = APIRouter(prefix="/api/activity", tags=["activity"])


@router.get("/streak", response_model=StreakOut)
def streak(
    days: int = Query(default=84, ge=7, le=366, description="Length of the calendar window ending today."),
    tz_offset: int = Query(default=0, ge=-840, le=840),
    ctx=Depends(require_profile),
    db: Session = Depends(get_db),
):
    return streak_report(db, ctx[0].id, tz_offset, days)
