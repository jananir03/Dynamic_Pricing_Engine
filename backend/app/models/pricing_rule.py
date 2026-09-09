from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RuleCombinationType

if TYPE_CHECKING:
    from app.models.rule_action import RuleAction
    from app.models.rule_condition import RuleCondition


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        index=True,
    )

    combination_type: Mapped[RuleCombinationType] = mapped_column(
        SQLEnum(RuleCombinationType),
        nullable=False,
        default=RuleCombinationType.COMBINE,
    )

    max_discount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    start_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
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

    conditions: Mapped[list["RuleCondition"]] = relationship(
        "RuleCondition",
        back_populates="rule",
        cascade="all, delete-orphan",
    )

    actions: Mapped[list["RuleAction"]] = relationship(
        "RuleAction",
        back_populates="rule",
        cascade="all, delete-orphan",
    )