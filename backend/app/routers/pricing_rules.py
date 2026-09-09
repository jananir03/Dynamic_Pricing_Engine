from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import AdminUser, CurrentUser
from app.models.enums import RuleCombinationType
from app.schemas.pricing_rule import (
    PricingRuleCreate,
    PricingRuleListResponse,
    PricingRuleResponse,
    PricingRuleStatusUpdate,
    PricingRuleUpdate,
)
from app.services.pricing_rule_service import (
    create_pricing_rule,
    delete_pricing_rule,
    get_pricing_rule,
    list_pricing_rules,
    update_pricing_rule,
    update_pricing_rule_status,
)


router = APIRouter(
    prefix="/api/pricing-rules",
    tags=["Pricing Rules"],
)


DBSession = Annotated[
    Session,
    Depends(get_db),
]


@router.post(
    "",
    response_model=PricingRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_pricing_rule_endpoint(
    data: PricingRuleCreate,
    db: DBSession,
    current_user: AdminUser,
):
    return create_pricing_rule(
        db,
        data,
    )


@router.get(
    "",
    response_model=PricingRuleListResponse,
)
def list_pricing_rules_endpoint(
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
    combination_type: RuleCombinationType | None = Query(
        default=None,
    ),
    sort_by: str = Query(
        default="priority",
    ),
    sort_order: str = Query(
        default="desc",
        pattern="^(asc|desc)$",
    ),
):
    rules, total, total_pages = list_pricing_rules(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        combination_type=combination_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return PricingRuleListResponse(
        items=rules,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{rule_id}",
    response_model=PricingRuleResponse,
)
def get_pricing_rule_endpoint(
    rule_id: int,
    db: DBSession,
    current_user: CurrentUser,
):
    return get_pricing_rule(
        db,
        rule_id,
        include_inactive=current_user.role_id is not None,
    )


@router.put(
    "/{rule_id}",
    response_model=PricingRuleResponse,
)
def update_pricing_rule_endpoint(
    rule_id: int,
    data: PricingRuleUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_pricing_rule(
        db,
        rule_id,
        data,
    )


@router.patch(
    "/{rule_id}/status",
    response_model=PricingRuleResponse,
)
def update_pricing_rule_status_endpoint(
    rule_id: int,
    data: PricingRuleStatusUpdate,
    db: DBSession,
    current_user: AdminUser,
):
    return update_pricing_rule_status(
        db,
        rule_id,
        data.is_active,
    )


@router.delete(
    "/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_pricing_rule_endpoint(
    rule_id: int,
    db: DBSession,
    current_user: AdminUser,
):
    delete_pricing_rule(
        db,
        rule_id,
    )