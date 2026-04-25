"""
Pydantic schemas for authentication endpoints.
"""

from typing import Literal, Optional
from pydantic import BaseModel


class AuthRequest(BaseModel):
    mode: Literal["signin", "signup", "google"] = "signin"
    email: str = ""
    password: str = ""
    name: str = ""
    country: str = ""


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    country: str


class AuthResponse(BaseModel):
    success: bool
    mode: str
    user: UserOut


class PatchAccountRequest(BaseModel):
    currentEmail: str = ""
    newEmail: str = ""
    name: str = ""
    country: str = ""


class ChangePasswordRequest(BaseModel):
    email: str = ""
    currentPassword: str = ""
    newPassword: str = ""


class DeleteAccountRequest(BaseModel):
    email: str = ""
