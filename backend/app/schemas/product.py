from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    category_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    sku: str = Field(..., min_length=1, max_length=100)
    base_price: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    base_price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )


class ProductStatusUpdate(BaseModel):
    is_active: bool


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    name: str
    description: str | None
    sku: str
    base_price: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int