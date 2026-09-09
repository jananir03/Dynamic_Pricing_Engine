from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import AdminUser, CurrentUser
from app.models.enums import DiscountType
from app.schemas.promotion import (
    PromotionCreate,
    PromotionListResponse,
    PromotionResponse,
    PromotionStatusUpdate,
    PromotionUpdate,
)
from app.services.promotion_service import (
    create_promotion,
    delete_promotion,
    get_promotion,
    get_promotion_by_code,
    list_promotions,
    update_promotion,
    update_promotion_status,
)


router = APIRouter(
    prefix="/api/promotions",
    tags=["Promotions"],
)


DBSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=PromotionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_promotion_endpoint(
    data: PromotionCreate,
    db: DBSession,
    current_user: AdminUser,
):
    return create_promotion(
        db,
        data,
    )


@router.get(
    "",
    response_model=PromotionListResponse,
)
def list_promotions_endpoint(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
    ),
    is_active: bool | None = Query(
        default=None,
    ),
    discount_type: DiscountType | None = Query(
        default=None,
    ),
    sort_by: str = Query(
        default="created_at",
    ),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    promotions, total, total_pages = list_promotions(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        discount_type=discount_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return PromotionListResponse(
        items=promotions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/code/{code}",
    response_model=PromotionResponse,
)
def get_promotion_by_code_endpoint(
    code: str,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_promotion_by_code(
        db,
        code,
        include_inactive=True,
    )


@router.get(
    "/{promotion_id}",
    response_model=PromotionResponse,
)
def get_promotion_endpoint(
    promotion_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_promotion(
        db,
        promotion_id,
        include_inactive=True,
    )


@router.put(
    "/{promotion_id}",
    response_model=PromotionResponse,
)
def update_promotion_endpoint(
    promotion_id: int,
    data: PromotionUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_promotion(
        db,
        promotion_id,
        data,
    )


@router.patch(
    "/{promotion_id}/status",
    response_model=PromotionResponse,
)
def update_promotion_status_endpoint(
    promotion_id: int,
    data: PromotionStatusUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_promotion_status(
        db,
        promotion_id,
        data.is_active,
    )


@router.delete(
    "/{promotion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_promotion_endpoint(
    promotion_id: int,
    db: DBSession,
    current_user: AdminUser,
):
    delete_promotion(
        db,
        promotion_id,
    )