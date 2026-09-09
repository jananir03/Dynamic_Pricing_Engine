from enum import Enum


class RuleCombinationType(str, Enum):
    COMBINE = "COMBINE"
    OVERRIDE = "OVERRIDE"
    STOP = "STOP"


class RuleActionType(str, Enum):
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT"
    FIXED_DISCOUNT = "FIXED_DISCOUNT"
    ADDITIONAL_CHARGE = "ADDITIONAL_CHARGE"
    TAX = "TAX"


class ConditionOperator(str, Enum):
    EQUALS = "EQUALS"
    NOT_EQUALS = "NOT_EQUALS"
    GREATER_THAN = "GREATER_THAN"
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL"
    LESS_THAN = "LESS_THAN"
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL"
    CONTAINS = "CONTAINS"
    NOT_CONTAINS = "NOT_CONTAINS"
    IN = "IN"
    NOT_IN = "NOT_IN"


class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"