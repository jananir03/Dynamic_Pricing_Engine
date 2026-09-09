from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.customer import CustomerType


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    customer_type: CustomerType
    customer_category: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=200)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    email: EmailStr | None = None
    customer_type: CustomerType | None = None
    customer_category: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=200)


class CustomerStatusUpdate(BaseModel):
    is_active: bool


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int