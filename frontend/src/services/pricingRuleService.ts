import api from "./api";

export type RuleCombinationType =
  | "COMBINE"
  | "OVERRIDE"
  | "STOP";

export type RuleActionType =
  | "PERCENTAGE_DISCOUNT"
  | "FIXED_DISCOUNT"
  | "ADDITIONAL_CHARGE"
  | "TAX";

export type ConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IN"
  | "NOT_IN";

export interface RuleCondition {
  id: number;
  rule_id: number;
  field: string;
  operator: ConditionOperator;
  value: string;
  condition_group: number;
}

export interface RuleAction {
  id: number;
  rule_id: number;
  action_type: RuleActionType;
  value: string;
  execution_order: number;
}

export interface PricingRule {
  id: number;
  name: string;
  description: string | null;
  priority: number;
  combination_type: RuleCombinationType;
  max_discount: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleConditionRequest {
  field: string;
  operator: ConditionOperator;
  value: string;
  condition_group: number;
}

export interface RuleActionRequest {
  action_type: RuleActionType;
  value: string;
  execution_order: number;
}

export interface PricingRuleCreateRequest {
  name: string;
  description?: string | null;
  priority: number;
  combination_type: RuleCombinationType;
  max_discount?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  conditions: RuleConditionRequest[];
  actions: RuleActionRequest[];
}

export interface PricingRuleUpdateRequest {
  name?: string;
  description?: string | null;
  priority?: number;
  combination_type?: RuleCombinationType;
  max_discount?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  conditions?: RuleConditionRequest[];
  actions?: RuleActionRequest[];
}

export interface PricingRuleStatusUpdateRequest {
  is_active: boolean;
}

export interface PricingRuleListParams {
  page?: number;
  page_size?: number;
  search?: string;
  combination_type?: RuleCombinationType;
  is_active?: boolean;
  sort_by?:
    | "id"
    | "name"
    | "priority"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
}

export interface PricingRuleListResponse {
  items: PricingRule[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getPricingRules(
  params: PricingRuleListParams = {},
): Promise<PricingRuleListResponse> {
  const response =
    await api.get<PricingRuleListResponse>(
      "/api/pricing-rules",
      {
        params,
      },
    );

  return response.data;
}

export async function getPricingRule(
  ruleId: number,
): Promise<PricingRule> {
  const response =
    await api.get<PricingRule>(
      `/api/pricing-rules/${ruleId}`,
    );

  return response.data;
}

export async function createPricingRule(
  data: PricingRuleCreateRequest,
): Promise<PricingRule> {
  const response =
    await api.post<PricingRule>(
      "/api/pricing-rules",
      data,
    );

  return response.data;
}

export async function updatePricingRule(
  ruleId: number,
  data: PricingRuleUpdateRequest,
): Promise<PricingRule> {
  const response =
    await api.put<PricingRule>(
      `/api/pricing-rules/${ruleId}`,
      data,
    );

  return response.data;
}

export async function updatePricingRuleStatus(
  ruleId: number,
  isActive: boolean,
): Promise<PricingRule> {
  const response =
    await api.patch<PricingRule>(
      `/api/pricing-rules/${ruleId}/status`,
      {
        is_active: isActive,
      },
    );

  return response.data;
}

export async function deletePricingRule(
  ruleId: number,
): Promise<void> {
  await api.delete(
    `/api/pricing-rules/${ruleId}`,
  );
}