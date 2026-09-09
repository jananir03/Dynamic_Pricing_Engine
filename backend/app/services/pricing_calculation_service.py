from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.calculation_rule import CalculationRule
from app.models.customer import Customer
from app.models.enums import (
    ConditionOperator,
    DiscountType,
    RuleActionType,
    RuleCombinationType,
)
from app.models.pricing_calculation import PricingCalculation
from app.models.pricing_rule import PricingRule
from app.models.product import Product
from app.models.promotion import Promotion
from app.models.rule_condition import RuleCondition
from app.schemas.pricing_calculation import (
    PricingCalculationRequest,
)


MONEY_QUANTUM = Decimal("0.01")


def _money(value: Decimal) -> Decimal:
    return value.quantize(
        MONEY_QUANTUM,
        rounding=ROUND_HALF_UP,
    )


def _to_comparable(value: object) -> str:
    if value is None:
        return ""

    if hasattr(value, "value"):
        return str(value.value)

    return str(value)


def _get_context_value(
    field: str,
    product: Product,
    customer: Customer,
    quantity: int,
    subtotal: Decimal,
) -> object:
    context = {
        "id": product.id,
        "product_id": product.id,
        "product_name": product.name,
        "product_sku": product.sku,
        "category_id": product.category_id,
        "base_price": product.base_price,
        "customer_id": customer.id,
        "customer_name": customer.name,
        "customer_email": customer.email,
        "customer_type": customer.customer_type,
        "customer_category": customer.customer_category,
        "location": customer.location,
        "quantity": quantity,
        "subtotal": subtotal,
    }

    return context.get(field)


def _parse_number(value: object) -> Decimal:
    try:
        return Decimal(str(value))
    except (
        ValueError,
        TypeError,
        ArithmeticError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Condition value '{value}' must be numeric "
                "for this comparison."
            ),
        ) from exc


def _evaluate_condition(
    condition: RuleCondition,
    product: Product,
    customer: Customer,
    quantity: int,
    subtotal: Decimal,
) -> bool:
    actual = _get_context_value(
        condition.field,
        product,
        customer,
        quantity,
        subtotal,
    )

    if actual is None:
        return False

    operator = condition.operator
    expected_raw = condition.value

    actual_string = _to_comparable(actual)
    expected_string = expected_raw

    if operator == ConditionOperator.EQUALS:
        return (
            actual_string.lower()
            == expected_string.lower()
        )

    if operator == ConditionOperator.NOT_EQUALS:
        return (
            actual_string.lower()
            != expected_string.lower()
        )

    if operator == ConditionOperator.CONTAINS:
        return (
            expected_string.lower()
            in actual_string.lower()
        )

    if operator == ConditionOperator.NOT_CONTAINS:
        return (
            expected_string.lower()
            not in actual_string.lower()
        )

    if operator == ConditionOperator.GREATER_THAN:
        return (
            _parse_number(actual)
            > _parse_number(expected_raw)
        )

    if operator == ConditionOperator.GREATER_THAN_OR_EQUAL:
        return (
            _parse_number(actual)
            >= _parse_number(expected_raw)
        )

    if operator == ConditionOperator.LESS_THAN:
        return (
            _parse_number(actual)
            < _parse_number(expected_raw)
        )

    if operator == ConditionOperator.LESS_THAN_OR_EQUAL:
        return (
            _parse_number(actual)
            <= _parse_number(expected_raw)
        )

    if operator in {
        ConditionOperator.IN,
        ConditionOperator.NOT_IN,
    }:
        values = [
            item.strip().lower()
            for item in expected_raw.split(",")
            if item.strip()
        ]

        actual_lower = actual_string.lower()

        if operator == ConditionOperator.IN:
            return actual_lower in values

        return actual_lower not in values

    return False


def _evaluate_rule(
    rule: PricingRule,
    product: Product,
    customer: Customer,
    quantity: int,
    subtotal: Decimal,
) -> bool:
    if not rule.conditions:
        return False

    grouped_conditions: dict[
        int,
        list[RuleCondition],
    ] = {}

    for condition in rule.conditions:
        grouped_conditions.setdefault(
            condition.condition_group,
            [],
        ).append(condition)

    # Same condition group = AND
    # Different groups = OR
    return any(
        all(
            _evaluate_condition(
                condition,
                product,
                customer,
                quantity,
                subtotal,
            )
            for condition in conditions
        )
        for conditions in grouped_conditions.values()
    )


def _apply_rule_actions(
    rule: PricingRule,
    current_amount: Decimal,
) -> tuple[
    Decimal,
    Decimal,
    Decimal,
    Decimal,
]:
    discount = Decimal("0.00")
    additional_charge = Decimal("0.00")
    tax = Decimal("0.00")

    ordered_actions = sorted(
        rule.actions,
        key=lambda action: action.execution_order,
    )

    for action in ordered_actions:
        value = Decimal(action.value)

        if (
            action.action_type
            == RuleActionType.PERCENTAGE_DISCOUNT
        ):
            action_discount = _money(
                current_amount
                * value
                / Decimal("100")
            )

            discount += action_discount

        elif (
            action.action_type
            == RuleActionType.FIXED_DISCOUNT
        ):
            discount += value

        elif (
            action.action_type
            == RuleActionType.ADDITIONAL_CHARGE
        ):
            additional_charge += value

        elif (
            action.action_type
            == RuleActionType.TAX
        ):
            tax += _money(
                current_amount
                * value
                / Decimal("100")
            )

    if rule.max_discount is not None:
        discount = min(
            discount,
            Decimal(rule.max_discount),
        )

    discount = _money(discount)
    additional_charge = _money(
        additional_charge,
    )
    tax = _money(tax)

    return (
        discount,
        additional_charge,
        tax,
        _money(
            current_amount
            - discount
            + additional_charge
            + tax
        ),
    )


def _validate_promotion(
    promotion: Promotion,
    subtotal: Decimal,
) -> None:
    now = datetime.now(timezone.utc)

    if not promotion.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promotion is inactive.",
        )

    start_date = promotion.start_date
    expiry_date = promotion.expiry_date

    if start_date.tzinfo is None:
        start_date = start_date.replace(
            tzinfo=timezone.utc,
        )

    if expiry_date.tzinfo is None:
        expiry_date = expiry_date.replace(
            tzinfo=timezone.utc,
        )

    if now < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promotion is not active yet.",
        )

    if now > expiry_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promotion has expired.",
        )

    if (
        promotion.usage_limit is not None
        and promotion.usage_count
        >= promotion.usage_limit
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Promotion usage limit has been reached."
            ),
        )

    if (
        subtotal
        < promotion.minimum_purchase
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Minimum purchase requirement for the "
                "promotion has not been met."
            ),
        )

    if (
        promotion.discount_type
        == DiscountType.PERCENTAGE
        and promotion.discount_value > 100
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Promotion percentage discount "
                "cannot exceed 100."
            ),
        )


def _calculate_promotion_discount(
    promotion: Promotion,
    amount: Decimal,
) -> Decimal:
    if (
        promotion.discount_type
        == DiscountType.PERCENTAGE
    ):
        discount = _money(
            amount
            * Decimal(promotion.discount_value)
            / Decimal("100")
        )

    elif (
        promotion.discount_type
        == DiscountType.FIXED
    ):
        discount = Decimal(
            promotion.discount_value,
        )

    else:
        discount = Decimal("0.00")

    if promotion.maximum_discount is not None:
        discount = min(
            discount,
            Decimal(
                promotion.maximum_discount,
            ),
        )

    return _money(
        min(
            discount,
            amount,
        )
    )


def _load_product(
    db: Session,
    product_id: int,
) -> Product:
    product = db.get(
        Product,
        product_id,
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found.",
        )

    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Product '{product.name}' "
                "is inactive."
            ),
        )

    return product


def _load_customer(
    db: Session,
    customer_id: int,
) -> Customer:
    customer = db.get(
        Customer,
        customer_id,
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    if not customer.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer is inactive.",
        )

    return customer


def _load_active_rules(
    db: Session,
) -> list[PricingRule]:
    now = datetime.now(timezone.utc)

    rules = list(
        db.scalars(
            select(PricingRule)
            .options(
                selectinload(
                    PricingRule.conditions
                ),
                selectinload(
                    PricingRule.actions
                ),
            )
            .where(
                PricingRule.is_active.is_(True),
            )
            .order_by(
                PricingRule.priority.desc(),
                PricingRule.id.asc(),
            )
        ).unique().all()
    )

    valid_rules: list[PricingRule] = []

    for rule in rules:
        start_date = rule.start_date
        end_date = rule.end_date

        if start_date is not None:
            if start_date.tzinfo is None:
                start_date = start_date.replace(
                    tzinfo=timezone.utc,
                )

            if now < start_date:
                continue

        if end_date is not None:
            if end_date.tzinfo is None:
                end_date = end_date.replace(
                    tzinfo=timezone.utc,
                )

            if now > end_date:
                continue

        valid_rules.append(rule)

    return valid_rules


def calculate_price(
    db: Session,
    data: PricingCalculationRequest,
) -> PricingCalculation:
    customer = _load_customer(
        db,
        data.customer_id,
    )

    active_rules = _load_active_rules(db)

    products: dict[int, Product] = {}

    for item in data.items:
        if item.product_id in products:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Each product can appear only once "
                    "in the calculation. Increase its "
                    "quantity instead."
                ),
            )

        products[item.product_id] = _load_product(
            db,
            item.product_id,
        )

    total_subtotal = Decimal("0.00")
    total_rule_discount = Decimal("0.00")
    total_additional_charge = Decimal("0.00")
    total_tax = Decimal("0.00")
    total_quantity = 0

    item_results: list[dict[str, object]] = []

    rule_totals: dict[
        int,
        dict[str, object],
    ] = {}

    for item in data.items:
        product = products[item.product_id]

        base_price = _money(
            Decimal(product.base_price)
        )

        item_subtotal = _money(
            base_price * item.quantity
        )

        total_subtotal += item_subtotal
        total_quantity += item.quantity

        item_rule_discount = Decimal("0.00")
        item_additional_charge = Decimal(
            "0.00"
        )
        item_tax = Decimal("0.00")

        current_amount = item_subtotal
        override_active = False

        item_rule_breakdown: list[
            dict[str, object]
        ] = []

        for rule in active_rules:
            if override_active:
                break

            matched = _evaluate_rule(
                rule,
                product,
                customer,
                item.quantity,
                item_subtotal,
            )

            if not matched:
                continue

            if (
                rule.combination_type
                == RuleCombinationType.OVERRIDE
            ):
                item_rule_discount = Decimal(
                    "0.00"
                )
                item_additional_charge = Decimal(
                    "0.00"
                )
                item_tax = Decimal("0.00")

                (
                    discount,
                    charge,
                    tax,
                    new_amount,
                ) = _apply_rule_actions(
                    rule,
                    item_subtotal,
                )

                item_rule_discount = discount
                item_additional_charge = charge
                item_tax = tax
                current_amount = new_amount

                override_active = True

            else:
                (
                    discount,
                    charge,
                    tax,
                    new_amount,
                ) = _apply_rule_actions(
                    rule,
                    current_amount,
                )

                item_rule_discount += discount
                item_additional_charge += charge
                item_tax += tax
                current_amount = new_amount

            item_rule_discount = min(
                item_rule_discount,
                item_subtotal,
            )

            rule_entry = rule_totals.setdefault(
                rule.id,
                {
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "discount_amount": Decimal(
                        "0.00"
                    ),
                    "item_count": 0,
                },
            )

            rule_entry[
                "discount_amount"
            ] = _money(
                Decimal(
                    str(
                        rule_entry[
                            "discount_amount"
                        ]
                    )
                )
                + discount
            )

            rule_entry["item_count"] = (
                int(
                    rule_entry[
                        "item_count"
                    ]
                )
                + 1
            )

            item_rule_breakdown.append(
                {
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "discount_amount": str(
                        _money(discount)
                    ),
                    "combination_type": (
                        rule.combination_type.value
                    ),
                }
            )

            if (
                rule.combination_type
                == RuleCombinationType.STOP
            ):
                break

        item_rule_discount = _money(
            item_rule_discount
        )

        item_additional_charge = _money(
            item_additional_charge
        )

        item_tax = _money(item_tax)

        total_rule_discount += (
            item_rule_discount
        )

        total_additional_charge += (
            item_additional_charge
        )

        total_tax += item_tax

        item_results.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "product_sku": product.sku,
                "quantity": item.quantity,
                "base_price": str(base_price),
                "subtotal": str(item_subtotal),
                "rule_discount": str(
                    item_rule_discount
                ),
                "additional_charge": str(
                    item_additional_charge
                ),
                "tax_amount": str(item_tax),
                "rule_breakdown": (
                    item_rule_breakdown
                ),
            }
        )

    total_subtotal = _money(
        total_subtotal
    )

    total_rule_discount = _money(
        min(
            total_rule_discount,
            total_subtotal,
        )
    )

    total_additional_charge = _money(
        total_additional_charge
    )

    total_tax = _money(total_tax)

    promotion_discount = Decimal(
        "0.00"
    )

    promotion = None

    if data.promotion_code:
        promotion = db.scalar(
            select(Promotion).where(
                func.upper(Promotion.code)
                == data.promotion_code.upper()
            )
        )

        if promotion is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Promotion not found.",
            )

        _validate_promotion(
            promotion,
            total_subtotal,
        )

        promotion_base = _money(
            total_subtotal
            - total_rule_discount
        )

        promotion_discount = (
            _calculate_promotion_discount(
                promotion,
                promotion_base,
            )
        )

    total_discount = _money(
        min(
            total_rule_discount
            + promotion_discount,
            total_subtotal,
        )
    )

    taxable_amount = _money(
        total_subtotal
        - total_discount
        + total_additional_charge
    )

    final_price = _money(
        taxable_amount
        + total_tax
    )

    final_price = max(
        final_price,
        Decimal("0.00"),
    )

    rule_discount_breakdown = [
        {
            "rule_id": int(
                entry["rule_id"]
            ),
            "rule_name": str(
                entry["rule_name"]
            ),
            "discount_amount": str(
                _money(
                    Decimal(
                        str(
                            entry[
                                "discount_amount"
                            ]
                        )
                    )
                )
            ),
            "item_count": int(
                entry["item_count"]
            ),
        }
        for entry in rule_totals.values()
        if Decimal(
            str(
                entry["discount_amount"]
            )
        ) > Decimal("0.00")
    ]

    rule_discount_breakdown.sort(
        key=lambda entry: entry["rule_id"]
    )

    first_product = products[
        data.items[0].product_id
    ]

    input_parameters = {
        "items": item_results,
        "customer_id": customer.id,
        "customer_name": customer.name,
        "customer_type": (
            customer.customer_type.value
            if hasattr(
                customer.customer_type,
                "value",
            )
            else str(
                customer.customer_type
            )
        ),
        "promotion_code": (
            data.promotion_code.upper()
            if data.promotion_code
            else None
        ),
        "base_price": str(
            _money(
                Decimal(
                    first_product.base_price
                )
            )
        ),
        "subtotal": str(total_subtotal),
        "rule_discount": str(
            total_rule_discount
        ),
        "rule_discounts": (
            rule_discount_breakdown
        ),
        "promotion_discount": str(
            promotion_discount
        ),
        "additional_charge": str(
            total_additional_charge
        ),
        "tax_amount": str(total_tax),
        "final_price": str(final_price),
        "total_quantity": total_quantity,
    }

    calculation = PricingCalculation(
        # Legacy fields remain for compatibility
        # with existing dashboard/history code.
        product_id=first_product.id,
        customer_id=customer.id,
        quantity=total_quantity,
        promotion_code=(
            data.promotion_code.upper()
            if data.promotion_code
            else None
        ),
        base_price=_money(
            Decimal(
                first_product.base_price
            )
        ),
        subtotal=total_subtotal,
        discount_amount=total_discount,
        additional_charge=(
            total_additional_charge
        ),
        tax_amount=total_tax,
        final_price=final_price,
        input_parameters=input_parameters,
    )

    calculation_rule_records: list[
        CalculationRule
    ] = []

    for rule in active_rules:
        entry = rule_totals.get(rule.id)

        if entry is None:
            calculation_rule_records.append(
                CalculationRule(
                    rule_id=rule.id,
                    matched=False,
                    applied=False,
                    discount_amount=Decimal(
                        "0.00"
                    ),
                )
            )

            continue

        aggregated_discount = _money(
            Decimal(
                str(
                    entry[
                        "discount_amount"
                    ]
                )
            )
        )

        calculation_rule_records.append(
            CalculationRule(
                rule_id=rule.id,
                matched=True,
                applied=True,
                discount_amount=(
                    aggregated_discount
                ),
            )
        )

    calculation.calculation_rules = (
        calculation_rule_records
    )

    db.add(calculation)

    if promotion is not None:
        promotion.usage_count += 1

    db.commit()
    db.refresh(calculation)

    return db.scalar(
        select(PricingCalculation)
        .options(
            selectinload(
                PricingCalculation.calculation_rules
            )
        )
        .where(
            PricingCalculation.id
            == calculation.id
        )
    )


def get_calculation(
    db: Session,
    calculation_id: int,
) -> PricingCalculation:
    calculation = db.scalar(
        select(PricingCalculation)
        .options(
            selectinload(
                PricingCalculation.calculation_rules
            )
        )
        .where(
            PricingCalculation.id
            == calculation_id
        )
    )

    if calculation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing calculation not found.",
        )

    return calculation


def list_calculations(
    db: Session,
    page: int,
    page_size: int,
    product_id: int | None,
    customer_id: int | None,
    promotion_code: str | None,
):
    query = (
        select(PricingCalculation)
        .options(
            selectinload(
                PricingCalculation.calculation_rules
            )
        )
    )

    if product_id is not None:
        query = query.where(
            PricingCalculation.product_id
            == product_id
        )

    if customer_id is not None:
        query = query.where(
            PricingCalculation.customer_id
            == customer_id
        )

    if promotion_code:
        query = query.where(
            func.upper(
                PricingCalculation.promotion_code
            )
            == promotion_code.upper()
        )

    query = query.order_by(
        PricingCalculation.calculated_at.desc(),
        PricingCalculation.id.desc(),
    )

    count_query = select(
        func.count()
    ).select_from(
        query.order_by(None).subquery()
    )

    total = db.scalar(
        count_query
    ) or 0

    offset = (
        page - 1
    ) * page_size

    calculations = list(
        db.scalars(
            query
            .offset(offset)
            .limit(page_size)
        ).unique().all()
    )

    total_pages = (
        ceil(total / page_size)
        if total
        else 0
    )

    return (
        calculations,
        total,
        total_pages,
    )