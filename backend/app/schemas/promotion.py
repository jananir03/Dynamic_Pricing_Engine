from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DiscountType


class PromotionCreate(BaseModel):
    code: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )
    discount_type: DiscountType
    discount_value: Decimal = Field(
        ...,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    minimum_purchase: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    maximum_discount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    start_date: datetime
    expiry_date: datetime
    usage_limit: int | None = Field(
        default=None,
        ge=1,
    )


class PromotionUpdate(BaseModel):
    code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    discount_type: DiscountType | None = None
    discount_value: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    minimum_purchase: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    maximum_discount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=12,
        decimal_places=2,
    )
    start_date: datetime | None = None
    expiry_date: datetime | None = None
    usage_limit: int | None = Field(
        default=None,
        ge=1,
    )


class PromotionStatusUpdate(BaseModel):
    is_active: bool


class PromotionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_type: DiscountType
    discount_value: Decimal
    minimum_purchase: Decimal
    maximum_discount: Decimal | None
    start_date: datetime
    expiry_date: datetime
    usage_limit: int | None
    usage_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PromotionListResponse(BaseModel):
    items: list[PromotionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int