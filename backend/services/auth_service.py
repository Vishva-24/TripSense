"""
Auth service: password hashing, verification, and user CRUD.

Password format is compatible with the existing Node.js scrypt implementation:
    stored = "<16-byte-hex-salt>:<64-byte-hex-hash>"

Python's hashlib.scrypt uses the same parameters (N=16384, r=8, p=1, dklen=64),
so passwords hashed by the Next.js backend can be verified here and vice-versa.
"""

import hashlib
import hmac
import os
import re

from sqlalchemy.orm import Session

from db.models import User


# ---------------------------------------------------------------------------
# String helpers
# ---------------------------------------------------------------------------

def normalize_email(value: str) -> str:
    return str(value or "").strip().lower()


def is_valid_email(value: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value))


def sanitize_profile_text(value: str, fallback: str = "") -> str:
    normalized = str(value or "").strip()
    return normalized if normalized else fallback


def is_guest_like_email(value: str) -> bool:
    return bool(re.search(r"@(guest\.)?tripsense\.local$", value, re.IGNORECASE))


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Produce a salt:hash string using scrypt — identical format to Node.js."""
    salt_bytes = os.urandom(16)
    salt_hex = salt_bytes.hex()
    hashed = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt_bytes,
        n=16384,
        r=8,
        p=1,
        dklen=64,
    )
    return f"{salt_hex}:{hashed.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Verify password against a salt:hash string. Timing-safe."""
    parts = str(stored or "").split(":")
    if len(parts) != 2:
        return False
    salt_hex, key_hex = parts
    if not salt_hex or not key_hex:
        return False
    try:
        salt_bytes = bytes.fromhex(salt_hex)
        key_bytes = bytes.fromhex(key_hex)
        derived = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt_bytes,
            n=16384,
            r=8,
            p=1,
            dklen=64,
        )
        return hmac.compare_digest(derived, key_bytes)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# User CRUD
# ---------------------------------------------------------------------------

def find_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def find_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    password_hash: str = "",
    name: str = "",
    country: str = "",
) -> User:
    user = User(email=email, password_hash=password_hash, name=name, country=country)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_profile(
    db: Session,
    user: User,
    new_email: str,
    name: str,
    country: str,
) -> User:
    user.email = new_email
    user.name = name
    user.country = country
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user: User, new_password: str) -> User:
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


def find_or_create_user_by_email(db: Session, email: str) -> User:
    """Find an existing user or create a minimal stub (guest/google flow)."""
    user = find_user_by_email(db, email)
    if user:
        return user
    return create_user(db, email=email)
