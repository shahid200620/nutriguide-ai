from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database.session import get_db
from app.models import User
from app.schemas.auth import CurrentUserOut, LoginRequest, RegisterRequest, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _current(user: User) -> CurrentUserOut:
    return CurrentUserOut(id=user.id, name=user.name, email=user.email, profile_complete=user.profile is not None)


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(name=body.name, email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id), user=_current(user))


@router.post("/login", response_model=TokenOut)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return TokenOut(access_token=create_access_token(user.id), user=_current(user))


@router.get("/me", response_model=CurrentUserOut)
def me(user: User = Depends(get_current_user)):
    return _current(user)
