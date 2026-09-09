from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ConditionOperator

if TYPE_CHECKING:
    from app.models.pricing_rule import PricingRule


class RuleCondition(Base):
    __tablename__ = "rule_conditions"

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

    field: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    operator: Mapped[ConditionOperator] = mapped_column(
        SQLEnum(ConditionOperator),
        nullable=False,
    )

    value: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    condition_group: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    rule: Mapped["PricingRule"] = relationship(
        "PricingRule",
        back_populates="conditions",
    )