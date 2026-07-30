from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["0. Auth"])


@router.post("/register", response_model=schemas.LoginResponse)
def register(payload: schemas.LoginRequest, name: str = "New User", db: Session = Depends(get_db)):
    """
    Creates a user account. There's no signup UI yet, so this exists to let
    you create your first user (e.g. via /docs) before logging in.
    """
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(
        name=name,
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "user_id": user.user_id})
    return schemas.LoginResponse(email=user.email, name=user.name, role=user.role, token=token)


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Verifies the submitted email/password against the database."""
    email = payload.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": user.email, "user_id": user.user_id})
    return schemas.LoginResponse(email=user.email, name=user.name, role=user.role, token=token)
