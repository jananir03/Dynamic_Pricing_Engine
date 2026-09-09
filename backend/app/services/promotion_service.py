from datetime import datetime, timezone
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.promotion import Promotion
from app.schemas.promotion import (
    PromotionCreate,
    PromotionUpdate,
)


def _validate_promotion_dates(
    start_date,
    expiry_date,
) -> None:
    if start_date >= expiry_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be earlier than expiry_date.",
        )


def _validate_discount(
    discount_type,
    discount_value,
) -> None:
    if discount_type.value == "PERCENTAGE":
        if discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentage discount cannot exceed 100.",
            )


def _validate_maximum_discount(
    discount_value,
    maximum_discount,
) -> None:
    if (
        maximum_discount is not None
        and maximum_discount <= 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="maximum_discount must be greater than zero.",
        )


def create_promotion(
    db: Session,
    data: PromotionCreate,
) -> Promotion:
    _validate_promotion_dates(
        data.start_date,
        data.expiry_date,
    )

    _validate_discount(
        data.discount_type,
        data.discount_value,
    )

    _validate_maximum_discount(
        data.discount_value,
        data.maximum_discount,
    )

    existing_promotion = db.scalar(
        select(Promotion).where(
            func.upper(Promotion.code)
            == data.code.upper()
        )
    )

    if existing_promotion:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A promotion with this code already exists.",
        )

    promotion = Promotion(
        code=data.code.upper(),
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        minimum_purchase=data.minimum_purchase,
        maximum_discount=data.maximum_discount,
        start_date=data.start_date,
        expiry_date=data.expiry_date,
        usage_limit=data.usage_limit,
        usage_count=0,
        is_active=True,
    )

    db.add(promotion)
    db.commit()
    db.refresh(promotion)

    return promotion


def get_promotion(
    db: Session,
    promotion_id: int,
    include_inactive: bool = True,
) -> Promotion:
    promotion = db.get(
        Promotion,
        promotion_id,
    )

    if promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found.",
        )

    if not include_inactive and not promotion.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found.",
        )

    return promotion


def get_promotion_by_code(
    db: Session,
    code: str,
    include_inactive: bool = True,
) -> Promotion:
    promotion = db.scalar(
        select(Promotion).where(
            func.upper(Promotion.code)
            == code.upper()
        )
    )

    if promotion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found.",
        )

    if not include_inactive and not promotion.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promotion not found.",
        )

    return promotion


def list_promotions(
    db: Session,
    page: int,
    page_size: int,
    search: str | None,
    is_active: bool | None,
    discount_type,
    sort_by: str,
    sort_order: str,
):
    query = select(Promotion)

    if search:
        pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Promotion.code.ilike(pattern),
            )
        )

    if is_active is not None:
        query = query.where(
            Promotion.is_active == is_active
        )

    if discount_type is not None:
        query = query.where(
            Promotion.discount_type == discount_type
        )

    allowed_sort_fields = {
        "id": Promotion.id,
        "code": Promotion.code,
        "discount_value": Promotion.discount_value,
        "start_date": Promotion.start_date,
        "expiry_date": Promotion.expiry_date,
        "usage_count": Promotion.usage_count,
        "created_at": Promotion.created_at,
        "updated_at": Promotion.updated_at,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Promotion.created_at,
    )

    if sort_order.lower() == "desc":
        query = query.order_by(
            sort_column.desc(),
            Promotion.id.desc(),
        )
    else:
        query = query.order_by(
            sort_column.asc(),
            Promotion.id.asc(),
        )

    count_query = select(func.count()).select_from(
        query.order_by(None).subquery()
    )

    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    promotions = list(db.scalars(query).all())

    total_pages = ceil(total / page_size) if total else 0

    return promotions, total, total_pages


def update_promotion(
    db: Session,
    promotion_id: int,
    data: PromotionUpdate,
) -> Promotion:
    promotion = get_promotion(
        db,
        promotion_id,
    )

    update_data = data.model_dump(
        exclude_unset=True,
    )

    new_start_date = update_data.get(
        "start_date",
        promotion.start_date,
    )

    new_expiry_date = update_data.get(
        "expiry_date",
        promotion.expiry_date,
    )

    _validate_promotion_dates(
        new_start_date,
        new_expiry_date,
    )

    new_discount_type = update_data.get(
        "discount_type",
        promotion.discount_type,
    )

    new_discount_value = update_data.get(
        "discount_value",
        promotion.discount_value,
    )

    _validate_discount(
        new_discount_type,
        new_discount_value,
    )

    if "code" in update_data:
        existing_promotion = db.scalar(
            select(Promotion).where(
                func.upper(Promotion.code)
                == update_data["code"].upper(),
                Promotion.id != promotion_id,
            )
        )

        if existing_promotion:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A promotion with this code "
                    "already exists."
                ),
            )

        update_data["code"] = update_data["code"].upper()

    for field, value in update_data.items():
        setattr(promotion, field, value)

    db.commit()
    db.refresh(promotion)

    return promotion


def update_promotion_status(
    db: Session,
    promotion_id: int,
    is_active: bool,
) -> Promotion:
    promotion = get_promotion(
        db,
        promotion_id,
    )

    promotion.is_active = is_active

    db.commit()
    db.refresh(promotion)

    return promotion


def delete_promotion(
    db: Session,
    promotion_id: int,
) -> None:
    promotion = get_promotion(
        db,
        promotion_id,
    )

    db.delete(promotion)
    db.commit()