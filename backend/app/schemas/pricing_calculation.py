from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PricingCalculationItemRequest(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class PricingCalculationRequest(BaseModel):
    customer_id: int = Field(..., gt=0)

    items: list[PricingCalculationItemRequest] = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    promotion_code: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )


class CalculationRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_id: int
    matched: bool
    applied: bool
    discount_amount: Decimal


class CalculationItemResponse(BaseModel):
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    base_price: Decimal
    subtotal: Decimal


class RuleDiscountResponse(BaseModel):
    rule_id: int
    rule_name: str
    discount_amount: Decimal
    item_count: int


class PricingCalculationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    customer_id: int
    quantity: int
    promotion_code: str | None

    base_price: Decimal
    subtotal: Decimal
    discount_amount: Decimal
    additional_charge: Decimal
    tax_amount: Decimal
    final_price: Decimal

    input_parameters: dict
    calculated_at: datetime

    calculation_rules: list[CalculationRuleResponse]

    items: list[CalculationItemResponse] = Field(
        default_factory=list,
    )

    rule_discounts: list[RuleDiscountResponse] = Field(
        default_factory=list,
    )

    promotion_discount: Decimal = Decimal("0.00")

    @model_validator(mode="after")
    def populate_breakdowns(
        self,
    ) -> "PricingCalculationResponse":
        stored_items = self.input_parameters.get(
            "items",
            [],
        )

        stored_rules = self.input_parameters.get(
            "rule_discounts",
            [],
        )

        stored_promotion = self.input_parameters.get(
            "promotion_discount",
            "0.00",
        )

        if stored_items:
            self.items = [
                CalculationItemResponse.model_validate(
                    item,
                )
                for item in stored_items
            ]

        if stored_rules:
            self.rule_discounts = [
                RuleDiscountResponse.model_validate(
                    rule,
                )
                for rule in stored_rules
            ]

        self.promotion_discount = Decimal(
            str(stored_promotion),
        )

        return self


class PricingCalculationListResponse(BaseModel):
    items: list[PricingCalculationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int