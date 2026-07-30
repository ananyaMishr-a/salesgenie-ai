import os
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

# Secret used to sign login tokens. Set SECRET_KEY in your .env for
# anything beyond local development - this fallback is fine for a
# classroom/demo run but should never be used in production.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-insecure-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# pbkdf2_sha256 is pure-Python (no compiled bcrypt backend to
# version-mismatch against), so it avoids the passlib/bcrypt
# "module 'bcrypt' has no attribute '__about__'" crash entirely.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
