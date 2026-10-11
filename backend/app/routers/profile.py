from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models import User
from app.schemas.profile import ProfileIn, ProfileOut
from app.services.profile_service import save_profile

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def get_profile(user: User = Depends(get_current_user)):
    if user.profile is None:
        raise HTTPException(status_code=404, detail="Please complete your profile.")
    return user.profile


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(body: ProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.profile is not None:
        raise HTTPException(status_code=409, detail="Profile already exists. Use PUT to update it.")
    return save_profile(db, user, body)


@router.put("", response_model=ProfileOut)
def update_profile(body: ProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.profile is None:
        raise HTTPException(status_code=404, detail="Please complete your profile.")
    return save_profile(db, user, body)
