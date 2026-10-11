from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import require_profile
from app.database.session import get_db
from app.models import HydrationLog
from app.schemas.hydration import HydrationIn, HydrationLogOut, HydrationToday
from app.services.hydration_service import hydration_status

router = APIRouter(prefix="/api/hydration", tags=["hydration"])


@router.get("/today", response_model=HydrationToday)
def today(tz_offset: int = Query(default=0, ge=-840, le=840), ctx=Depends(require_profile), db: Session = Depends(get_db)):
    user, profile, _ = ctx
    status_, entries = hydration_status(db, user.id, profile.weight_kg, tz_offset)
    return {**status_, "entries": entries}


@router.post("", response_model=HydrationLogOut, status_code=status.HTTP_201_CREATED)
def add(body: HydrationIn, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    user, _, _ = ctx
    try:
        log = HydrationLog(user_id=user.id, amount_ml=body.amount_ml)
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to save hydration entry.")
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(log_id: int, ctx=Depends(require_profile), db: Session = Depends(get_db)):
    log = db.scalar(select(HydrationLog).where(HydrationLog.id == log_id, HydrationLog.user_id == ctx[0].id))
    if log is None:
        raise HTTPException(status_code=404, detail="Hydration entry not found.")
    db.delete(log)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
