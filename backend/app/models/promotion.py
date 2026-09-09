from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    String,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import DiscountType


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    discount_type: Mapped[DiscountType] = mapped_column(
        SQLEnum(DiscountType),
        nullable=False,
    )

    discount_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    minimum_purchase: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    maximum_discount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    expiry_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    usage_limit: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    usage_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
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