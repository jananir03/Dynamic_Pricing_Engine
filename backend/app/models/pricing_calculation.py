from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.calculation_rule import CalculationRule
    from app.models.customer import Customer
    from app.models.product import Product


class PricingCalculation(Base):
    __tablename__ = "pricing_calculations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    promotion_code: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    base_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    additional_charge: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    final_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    input_parameters: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="pricing_calculations",
    )

    customer: Mapped["Customer"] = relationship(
        "Customer",
    )

    calculation_rules: Mapped[list["CalculationRule"]] = relationship(
        "CalculationRule",
        back_populates="calculation",
        cascade="all, delete-orphan",
    )