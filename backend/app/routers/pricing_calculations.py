from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import CurrentUser
from app.schemas.pricing_calculation import (
    PricingCalculationListResponse,
    PricingCalculationRequest,
    PricingCalculationResponse,
)
from app.services.pricing_calculation_service import (
    calculate_price,
    get_calculation,
    list_calculations,
)


router = APIRouter(
    prefix="/api/pricing-calculations",
    tags=["Pricing Calculations"],
)


DBSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "/calculate",
    response_model=PricingCalculationResponse,
    status_code=status.HTTP_201_CREATED,
)
def calculate_price_endpoint(
    data: PricingCalculationRequest,
    db: DBSession,
    current_user: CurrentUser,
):
    return calculate_price(
        db,
        data,
    )


@router.get(
    "",
    response_model=PricingCalculationListResponse,
)
def list_calculations_endpoint(
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
    product_id: int | None = Query(
        default=None,
        gt=0,
    ),
    customer_id: int | None = Query(
        default=None,
        gt=0,
    ),
    promotion_code: str | None = Query(
        default=None,
        min_length=1,
        max_length=50,
    ),
):
    calculations, total, total_pages = (
        list_calculations(
            db=db,
            page=page,
            page_size=page_size,
            product_id=product_id,
            customer_id=customer_id,
            promotion_code=promotion_code,
        )
    )

    return PricingCalculationListResponse(
        items=calculations,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{calculation_id}",
    response_model=PricingCalculationResponse,
)
def get_calculation_endpoint(
    calculation_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_calculation(
        db,
        calculation_id,
    )