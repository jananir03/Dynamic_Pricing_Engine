from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RuleActionType

if TYPE_CHECKING:
    from app.models.pricing_rule import PricingRule


class RuleAction(Base):
    __tablename__ = "rule_actions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    rule_id: Mapped[int] = mapped_column(
        ForeignKey(
            "pricing_rules.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    action_type: Mapped[RuleActionType] = mapped_column(
        SQLEnum(RuleActionType),
        nullable=False,
        index=True,
    )

    value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    execution_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    rule: Mapped["PricingRule"] = relationship(
        "PricingRule",
        back_populates="actions",
    )