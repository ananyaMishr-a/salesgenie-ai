import secrets
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["0. Auth"])


PENDING_SIGNUPS = {}
PENDING_DELETIONS = {}

@router.post("/request-otp")
def request_otp(payload: schemas.SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Generates a 6-digit OTP for signup and stores the payload in memory."""
    email = payload.email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Generate a cryptographically secure 6-digit OTP
    otp_code = str(secrets.randbelow(1000000)).zfill(6)
    
    PENDING_SIGNUPS[email] = {
        "name": payload.name,
        "password": payload.password,
        "otp": otp_code
    }
    
    # Dispatch email in the background to avoid blocking the HTTP request
    background_tasks.add_task(send_otp_email, email, otp_code)
    
    print(f"\n========== OTP GENERATED ==========\nEmail: {email}\nOTP Code: {otp_code}\n===================================\n")
    
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp", response_model=schemas.LoginResponse)
def verify_otp(payload: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    """Verifies the OTP code and creates the user account."""
    email = payload.email.strip().lower()
    if email not in PENDING_SIGNUPS:
        raise HTTPException(status_code=400, detail="No pending signup found or OTP expired")
        
    pending = PENDING_SIGNUPS[email]
    if pending["otp"] != payload.otp_code:
        raise HTTPException(status_code=401, detail="Invalid OTP code")
        
    user = models.User(
        name=pending["name"],
        email=email,
        password_hash=hash_password(pending["password"]),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Clean up pending signup
    del PENDING_SIGNUPS[email]
    
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


@router.put("/me/profile")
def update_profile(payload: schemas.UpdateProfileRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    current_user.name = payload.name
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "name": current_user.name}


@router.put("/me/password")
def update_password(payload: schemas.UpdatePasswordRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect old password")
    
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/me/delete-otp")
def request_delete_otp(payload: schemas.RequestDeleteOtpRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(get_current_user)):
    if payload.email.strip().lower() != current_user.email:
        raise HTTPException(status_code=400, detail="Email does not match")
        
    if not verify_password(payload.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    otp_code = str(secrets.randbelow(1000000)).zfill(6)
    PENDING_DELETIONS[current_user.email] = otp_code
    background_tasks.add_task(send_otp_email, current_user.email, otp_code)
    print(f"\n========== DELETION OTP GENERATED ==========\nEmail: {current_user.email}\nOTP Code: {otp_code}\n===================================\n")
    return {"message": "OTP sent successfully"}


@router.post("/me/delete")
def delete_account(payload: schemas.DeleteAccountRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if payload.email.strip().lower() != current_user.email:
        raise HTTPException(status_code=400, detail="Email does not match")
        
    if not verify_password(payload.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    if current_user.email not in PENDING_DELETIONS or PENDING_DELETIONS[current_user.email] != payload.otp_code:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP code")
        
    db.delete(current_user)
    db.commit()
    del PENDING_DELETIONS[current_user.email]
    
    print(f"[DELETION REASON] User {current_user.email} left because: {payload.reason}")
    return {"message": "Account deleted successfully"}
