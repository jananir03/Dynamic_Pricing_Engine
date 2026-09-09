from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import AdminUser, CurrentUser
from app.schemas.category import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryStatusUpdate,
    CategoryUpdate,
)
from app.services.category_service import (
    create_category,
    delete_category,
    get_category,
    list_categories,
    update_category,
    update_category_status,
)


router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)


DBSession = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category_endpoint(
    data: CategoryCreate,
    db: DBSession,
    current_user: AdminUser,
):
    return create_category(db, data)


@router.get(
    "",
    response_model=CategoryListResponse,
)
def list_categories_endpoint(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
):
    categories, total, total_pages = list_categories(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return CategoryListResponse(
        items=categories,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def get_category_endpoint(
    category_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_category(db, category_id)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category_endpoint(
    category_id: int,
    data: CategoryUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_category(
        db,
        category_id,
        data,
    )


@router.patch(
    "/{category_id}/status",
    response_model=CategoryResponse,
)
def update_category_status_endpoint(
    category_id: int,
    data: CategoryStatusUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_category_status(
        db,
        category_id,
        data.is_active,
    )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category_endpoint(
    category_id: int,
    db: DBSession,
    current_user: AdminUser,
):
    delete_category(db, category_id)