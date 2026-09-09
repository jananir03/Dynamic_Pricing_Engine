from datetime import datetime, timezone
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.pricing_rule import PricingRule
from app.models.rule_action import RuleAction
from app.models.rule_condition import RuleCondition
from app.schemas.pricing_rule import (
    PricingRuleCreate,
    PricingRuleUpdate,
)


def _validate_rule_dates(
    start_date,
    end_date,
) -> None:
    if (
        start_date is not None
        and end_date is not None
        and start_date >= end_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be earlier than end_date.",
        )


def _validate_conditions_and_actions(
    data: PricingRuleCreate | PricingRuleUpdate,
) -> None:
    conditions = getattr(data, "conditions", None)
    actions = getattr(data, "actions", None)

    if conditions is not None and len(conditions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pricing rule must contain at least one condition.",
        )

    if actions is not None and len(actions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pricing rule must contain at least one action.",
        )


def _validate_action_values(data) -> None:
    actions = getattr(data, "actions", None)

    if actions is None:
        return

    for action in actions:
        if action.action_type.value == "PERCENTAGE_DISCOUNT":
            if action.value > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Percentage discount action value "
                        "cannot exceed 100."
                    ),
                )

        if action.action_type.value == "TAX":
            if action.value > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tax percentage cannot exceed 100.",
                )


def _validate_max_discount(data) -> None:
    max_discount = getattr(data, "max_discount", None)

    if max_discount is not None and max_discount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="max_discount cannot be negative.",
        )


def _get_rule_for_update(
    db: Session,
    rule_id: int,
) -> PricingRule:
    rule = db.scalar(
        select(PricingRule)
        .options(
            selectinload(PricingRule.conditions),
            selectinload(PricingRule.actions),
        )
        .where(PricingRule.id == rule_id)
    )

    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found.",
        )

    return rule


def create_pricing_rule(
    db: Session,
    data: PricingRuleCreate,
) -> PricingRule:
    _validate_rule_dates(
        data.start_date,
        data.end_date,
    )

    _validate_conditions_and_actions(data)
    _validate_action_values(data)
    _validate_max_discount(data)

    existing_rule = db.scalar(
        select(PricingRule).where(
            PricingRule.name == data.name,
        )
    )

    if existing_rule:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pricing rule with this name already exists.",
        )

    rule = PricingRule(
        name=data.name,
        description=data.description,
        priority=data.priority,
        combination_type=data.combination_type,
        max_discount=data.max_discount,
        start_date=data.start_date,
        end_date=data.end_date,
        is_active=True,
    )

    for condition_data in data.conditions:
        condition = RuleCondition(
            field=condition_data.field,
            operator=condition_data.operator,
            value=condition_data.value,
            condition_group=condition_data.condition_group,
        )

        rule.conditions.append(condition)

    for action_data in data.actions:
        action = RuleAction(
            action_type=action_data.action_type,
            value=action_data.value,
            execution_order=action_data.execution_order,
        )

        rule.actions.append(action)

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return _get_rule_for_update(db, rule.id)


def get_pricing_rule(
    db: Session,
    rule_id: int,
    include_inactive: bool = True,
) -> PricingRule:
    rule = _get_rule_for_update(db, rule_id)

    if not include_inactive and not rule.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found.",
        )

    return rule


def list_pricing_rules(
    db: Session,
    page: int,
    page_size: int,
    search: str | None,
    is_active: bool | None,
    combination_type,
    sort_by: str,
    sort_order: str,
):
    query = (
        select(PricingRule)
        .options(
            selectinload(PricingRule.conditions),
            selectinload(PricingRule.actions),
        )
    )

    if search:
        pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                PricingRule.name.ilike(pattern),
                PricingRule.description.ilike(pattern),
            )
        )

    if is_active is not None:
        query = query.where(
            PricingRule.is_active == is_active
        )

    if combination_type is not None:
        query = query.where(
            PricingRule.combination_type == combination_type
        )

    allowed_sort_fields = {
        "id": PricingRule.id,
        "name": PricingRule.name,
        "priority": PricingRule.priority,
        "created_at": PricingRule.created_at,
        "updated_at": PricingRule.updated_at,
        "start_date": PricingRule.start_date,
        "end_date": PricingRule.end_date,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        PricingRule.priority,
    )

    if sort_order.lower() == "desc":
        query = query.order_by(
            sort_column.desc(),
            PricingRule.id.desc(),
        )
    else:
        query = query.order_by(
            sort_column.asc(),
            PricingRule.id.asc(),
        )

    count_query = select(func.count()).select_from(
        query.order_by(None).subquery()
    )

    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    rules = list(db.scalars(query).unique().all())

    total_pages = ceil(total / page_size) if total else 0

    return rules, total, total_pages


def update_pricing_rule(
    db: Session,
    rule_id: int,
    data: PricingRuleUpdate,
) -> PricingRule:
    rule = _get_rule_for_update(db, rule_id)

    update_data = data.model_dump(
        exclude_unset=True,
        exclude={"conditions", "actions"},
    )

    new_start_date = update_data.get(
        "start_date",
        rule.start_date,
    )

    new_end_date = update_data.get(
        "end_date",
        rule.end_date,
    )

    _validate_rule_dates(
        new_start_date,
        new_end_date,
    )

    _validate_action_values(data)
    _validate_max_discount(data)

    if "name" in update_data:
        existing_rule = db.scalar(
            select(PricingRule).where(
                PricingRule.name == update_data["name"],
                PricingRule.id != rule_id,
            )
        )

        if existing_rule:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A pricing rule with this name "
                    "already exists."
                ),
            )

    for field, value in update_data.items():
        setattr(rule, field, value)

    if data.conditions is not None:
        if len(data.conditions) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A pricing rule must contain at least "
                    "one condition."
                ),
            )

        rule.conditions.clear()

        for condition_data in data.conditions:
            rule.conditions.append(
                RuleCondition(
                    field=condition_data.field,
                    operator=condition_data.operator,
                    value=condition_data.value,
                    condition_group=condition_data.condition_group,
                )
            )

    if data.actions is not None:
        if len(data.actions) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A pricing rule must contain at least "
                    "one action."
                ),
            )

        rule.actions.clear()

        for action_data in data.actions:
            rule.actions.append(
                RuleAction(
                    action_type=action_data.action_type,
                    value=action_data.value,
                    execution_order=action_data.execution_order,
                )
            )

    db.commit()
    db.refresh(rule)

    return _get_rule_for_update(db, rule.id)


def update_pricing_rule_status(
    db: Session,
    rule_id: int,
    is_active: bool,
) -> PricingRule:
    rule = _get_rule_for_update(db, rule_id)

    rule.is_active = is_active

    db.commit()
    db.refresh(rule)

    return _get_rule_for_update(db, rule.id)


def delete_pricing_rule(
    db: Session,
    rule_id: int,
) -> None:
    rule = _get_rule_for_update(db, rule_id)

    db.delete(rule)
    db.commit()