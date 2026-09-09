from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import AdminUser, CurrentUser
from app.models.customer import CustomerType
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
    CustomerStatusUpdate,
    CustomerUpdate,
)
from app.services.customer_service import (
    create_customer,
    delete_customer,
    get_customer,
    list_customers,
    update_customer,
    update_customer_status,
)


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)


DBSession = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_endpoint(
    data: CustomerCreate,
    db: DBSession,
    current_user: AdminUser,
):
    return create_customer(db, data)


@router.get(
    "",
    response_model=CustomerListResponse,
)
def list_customers_endpoint(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    customer_type: CustomerType | None = Query(default=None),
    customer_category: str | None = Query(default=None),
    location: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    customers, total, total_pages = list_customers(
        db=db,
        role_id=current_user.role_id,
        page=page,
        page_size=page_size,
        search=search,
        customer_type=customer_type,
        customer_category=customer_category,
        location=location,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return CustomerListResponse(
        items=customers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def get_customer_endpoint(
    customer_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_customer(
        db,
        customer_id,
        current_user.role_id,
    )


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer_endpoint(
    customer_id: int,
    data: CustomerUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_customer(
        db,
        customer_id,
        data,
    )


@router.patch(
    "/{customer_id}/status",
    response_model=CustomerResponse,
)
def update_customer_status_endpoint(
    customer_id: int,
    data: CustomerStatusUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_customer_status(
        db,
        customer_id,
        data.is_active,
    )


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer_endpoint(
    customer_id: int,
    db: DBSession,
    current_user: AdminUser,
):
    delete_customer(db, customer_id)