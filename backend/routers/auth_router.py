"""
Auth router — maps to:
  POST   /api/auth/email    (signin / signup / google)
  PATCH  /api/auth/account  (update profile)
  POST   /api/auth/account  (change password)
  DELETE /api/auth/account  (delete account)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.session import get_db
from schemas.auth_schemas import (
    AuthRequest,
    AuthResponse,
    ChangePasswordRequest,
    DeleteAccountRequest,
    PatchAccountRequest,
    UserOut,
)
from services.auth_service import (
    create_user,
    delete_user,
    find_user_by_email,
    hash_password,
    is_valid_email,
    normalize_email,
    sanitize_profile_text,
    update_user_password,
    update_user_profile,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# POST /api/auth/email
# ---------------------------------------------------------------------------

@router.post("/email")
async def auth_email(body: AuthRequest, db: Session = Depends(get_db)):
    mode = body.mode or "signin"
    email = normalize_email(body.email)
    password = str(body.password or "")
    name = sanitize_profile_text(body.name)
    country = sanitize_profile_text(body.country)

    if not email or not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Valid email is required.")

    if mode != "google" and not password.strip():
        raise HTTPException(status_code=400, detail="Password is required.")

    if mode == "signup" and not name:
        raise HTTPException(status_code=400, detail="Name is required for sign up.")

    if mode == "signup" and not country:
        raise HTTPException(status_code=400, detail="Country is required for sign up.")

    if mode == "signup" and len(password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing_user = find_user_by_email(db, email)

    # ----- SIGN IN -----
    if mode == "signin":
        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="No account found for this email. Please sign up first.",
            )
        if not existing_user.password_hash:
            raise HTTPException(
                status_code=409,
                detail=(
                    "This account has no password yet. "
                    "Please click Sign up once with the same email to set a password."
                ),
            )
        if not verify_password(password, existing_user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect password.")

        return {
            "success": True,
            "mode": mode,
            "user": {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name or "",
                "country": existing_user.country or "",
            },
        }

    # ----- SIGN UP -----
    if mode == "signup":
        password_hash = hash_password(password)
        if existing_user:
            if existing_user.password_hash:
                raise HTTPException(
                    status_code=409,
                    detail="Account already exists. Please sign in.",
                )
            # Stub user from guest/google — set password and profile
            updated = update_user_profile(db, existing_user, email, name, country)
            updated.password_hash = password_hash
            db.commit()
            db.refresh(updated)
            return {
                "success": True,
                "mode": mode,
                "user": {
                    "id": updated.id,
                    "email": updated.email,
                    "name": updated.name or "",
                    "country": updated.country or "",
                },
            }

        created = create_user(db, email=email, password_hash=password_hash, name=name, country=country)
        return {
            "success": True,
            "mode": mode,
            "user": {
                "id": created.id,
                "email": created.email,
                "name": created.name or "",
                "country": created.country or "",
            },
        }

    # ----- GOOGLE -----
    if existing_user:
        return {
            "success": True,
            "mode": mode,
            "user": {
                "id": existing_user.id,
                "email": existing_user.email,
                "name": existing_user.name or "",
                "country": existing_user.country or "",
            },
        }

    google_user = create_user(
        db,
        email=email,
        password_hash="",
        name=name or email.split("@")[0] or "Traveler",
        country=country or "",
    )
    return {
        "success": True,
        "mode": mode,
        "user": {
            "id": google_user.id,
            "email": google_user.email,
            "name": google_user.name or "",
            "country": google_user.country or "",
        },
    }


# ---------------------------------------------------------------------------
# PATCH /api/auth/account — update profile
# ---------------------------------------------------------------------------

@router.patch("/account")
async def patch_account(body: PatchAccountRequest, db: Session = Depends(get_db)):
    current_email = normalize_email(body.currentEmail)
    new_email = normalize_email(body.newEmail)
    name = str(body.name or "").strip()
    country = str(body.country or "").strip()

    if not current_email or not new_email or not is_valid_email(new_email):
        raise HTTPException(status_code=400, detail="Valid currentEmail and newEmail are required.")
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")
    if not country:
        raise HTTPException(status_code=400, detail="Country is required.")

    existing = find_user_by_email(db, current_email)
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found.")

    if current_email != new_email:
        conflict = find_user_by_email(db, new_email)
        if conflict:
            raise HTTPException(status_code=409, detail="Email already in use. Try a different email.")

    updated = update_user_profile(db, existing, new_email, name, country)
    return {
        "success": True,
        "user": {
            "id": updated.id,
            "email": updated.email,
            "name": updated.name or "",
            "country": updated.country or "",
        },
    }


# ---------------------------------------------------------------------------
# POST /api/auth/account — change password
# ---------------------------------------------------------------------------

@router.post("/account")
async def change_password(body: ChangePasswordRequest, db: Session = Depends(get_db)):
    email = normalize_email(body.email)
    current_password = str(body.currentPassword or "")
    new_password = str(body.newPassword or "")

    if not email or not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Valid email is required.")
    if len(new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    user = find_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    if user.password_hash and not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    updated = update_user_password(db, user, new_password)
    return {
        "success": True,
        "user": {"id": updated.id, "email": updated.email},
        "message": "Password updated successfully.",
    }


# ---------------------------------------------------------------------------
# DELETE /api/auth/account — delete account
# ---------------------------------------------------------------------------

@router.delete("/account")
async def delete_account(body: DeleteAccountRequest, db: Session = Depends(get_db)):
    email = normalize_email(body.email)

    if not email or not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Valid email is required.")

    user = find_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    user_id = user.id
    user_email = user.email
    delete_user(db, user)
    return {"success": True, "user": {"id": user_id, "email": user_email}}
