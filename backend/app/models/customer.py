from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.pricing_calculation import PricingCalculation


class CustomerType(str, Enum):
    REGULAR = "REGULAR"
    PREMIUM = "PREMIUM"
    BUSINESS = "BUSINESS"
    WHOLESALE = "WHOLESALE"


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    customer_type: Mapped[CustomerType] = mapped_column(
        SQLEnum(CustomerType),
        nullable=False,
        index=True,
    )

    customer_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    pricing_calculations: Mapped[list["PricingCalculation"]] = relationship(
        "PricingCalculation",
        back_populates="customer",
    )