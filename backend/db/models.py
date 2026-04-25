"""
SQLAlchemy ORM models that mirror the existing Neon PostgreSQL schema exactly.
Do NOT alter column names or types — these map 1:1 to the Drizzle schema.
"""

import enum
import uuid
from datetime import datetime, date as date_type
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.session import Base


class ActivityTypeEnum(str, enum.Enum):
    food = "food"
    landmark = "landmark"
    transit = "transit"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False, default="")
    name: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    country: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    trips: Mapped[list["Trip"]] = relationship(
        "Trip", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("email", name="users_email_unique"),)


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    end_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    budget_tier: Mapped[str] = mapped_column(String(50), nullable=False)
    travel_group: Mapped[str] = mapped_column(String(50), nullable=False)
    vibe: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    dietary_prefs: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default="{}"
    )
    must_dos: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_cost: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    estimated_currency: Mapped[str | None] = mapped_column(
        String(12), nullable=True
    )
    estimated_cost_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="trips")
    itinerary_days: Mapped[list["ItineraryDay"]] = relationship(
        "ItineraryDay", back_populates="trip", cascade="all, delete-orphan"
    )


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="itinerary_days")
    activities: Mapped[list["Activity"]] = relationship(
        "Activity", back_populates="day", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("trip_id", "day_number", name="trip_day_unique"),
    )


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    day_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False
    )
    time: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[ActivityTypeEnum] = mapped_column(
        Enum(ActivityTypeEnum, name="activity_type"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    cost_estimate: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    day: Mapped["ItineraryDay"] = relationship("ItineraryDay", back_populates="activities")


class AgentRequest(Base):
    __tablename__ = "agent_requests"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    trip: Mapped["Trip"] = relationship("Trip")
    user: Mapped["User"] = relationship("User")
