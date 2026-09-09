from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import AdminUser, CurrentUser
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductStatusUpdate,
    ProductUpdate,
)
from app.services.product_service import (
    create_product,
    delete_product,
    get_product,
    list_products,
    update_product,
    update_product_status,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


DBSession = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product_endpoint(
    data: ProductCreate,
    db: DBSession,
    current_user: AdminUser,
):
    return create_product(db, data)


@router.get(
    "",
    response_model=ProductListResponse,
)
def list_products_endpoint(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    category_id: int | None = Query(default=None, gt=0),
    is_active: bool | None = Query(default=None),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    products, total, total_pages = list_products(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        is_active=is_active,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product_endpoint(
    product_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_product(db, product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product_endpoint(
    product_id: int,
    data: ProductUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_product(
        db,
        product_id,
        data,
    )


@router.patch(
    "/{product_id}/status",
    response_model=ProductResponse,
)
def update_product_status_endpoint(
    product_id: int,
    data: ProductStatusUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_product_status(
        db,
        product_id,
        data.is_active,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product_endpoint(
    product_id: int,
    db: DBSession,
    current_user: AdminUser,
):
    delete_product(db, product_id)