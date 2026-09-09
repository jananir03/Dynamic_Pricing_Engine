from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    ConditionOperator,
    RuleActionType,
    RuleCombinationType,
)


class RuleConditionCreate(BaseModel):
    field: str = Field(..., min_length=1, max_length=100)
    operator: ConditionOperator
    value: str = Field(..., min_length=1, max_length=500)
    condition_group: int = Field(default=0, ge=0)


class RuleConditionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    field: str
    operator: ConditionOperator
    value: str
    condition_group: int


class RuleActionCreate(BaseModel):
    action_type: RuleActionType
    value: Decimal = Field(
        ...,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    execution_order: int = Field(
        default=0,
        ge=0,
    )


class RuleActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action_type: RuleActionType
    value: Decimal
    execution_order: int


class PricingRuleCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    priority: int = Field(
        default=0,
        ge=0,
    )
    combination_type: RuleCombinationType = (
        RuleCombinationType.COMBINE
    )
    max_discount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    start_date: datetime | None = None
    end_date: datetime | None = None

    conditions: list[RuleConditionCreate] = Field(
        default_factory=list,
    )
    actions: list[RuleActionCreate] = Field(
        default_factory=list,
    )


class PricingRuleUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    priority: int | None = Field(
        default=None,
        ge=0,
    )
    combination_type: RuleCombinationType | None = None
    max_discount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    start_date: datetime | None = None
    end_date: datetime | None = None

    conditions: list[RuleConditionCreate] | None = None
    actions: list[RuleActionCreate] | None = None


class PricingRuleStatusUpdate(BaseModel):
    is_active: bool


class PricingRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    priority: int
    combination_type: RuleCombinationType
    max_discount: Decimal | None
    start_date: datetime | None
    end_date: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    conditions: list[RuleConditionResponse]
    actions: list[RuleActionResponse]


class PricingRuleListResponse(BaseModel):
    items: list[PricingRuleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int