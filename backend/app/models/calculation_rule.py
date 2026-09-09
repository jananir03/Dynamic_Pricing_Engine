from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.pricing_calculation import PricingCalculation
    from app.models.pricing_rule import PricingRule


class CalculationRule(Base):
    __tablename__ = "calculation_rules"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    calculation_id: Mapped[int] = mapped_column(
        ForeignKey(
            "pricing_calculations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    rule_id: Mapped[int] = mapped_column(
        ForeignKey("pricing_rules.id"),
        nullable=False,
        index=True,
    )

    matched: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    applied: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    calculation: Mapped["PricingCalculation"] = relationship(
        "PricingCalculation",
        back_populates="calculation_rules",
    )

    rule: Mapped["PricingRule"] = relationship(
        "PricingRule",
    )