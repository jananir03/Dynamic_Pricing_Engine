import api from "./api";

export interface PricingCalculationItemRequest {
  product_id: number;
  quantity: number;
}

export interface PricingCalculationRequest {
  customer_id: number;
  items: PricingCalculationItemRequest[];
  promotion_code: string | null;
}

export interface CalculationRule {
  id: number;
  rule_id: number;
  matched: boolean;
  applied: boolean;
  discount_amount: string;
}

export interface CalculationItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  base_price: string;
  subtotal: string;
}

export interface RuleDiscount {
  rule_id: number;
  rule_name: string;
  discount_amount: string;
  item_count: number;
}

export interface PricingCalculation {
  id: number;
  product_id: number;
  customer_id: number;
  quantity: number;
  promotion_code: string | null;

  base_price: string;
  subtotal: string;
  discount_amount: string;
  additional_charge: string;
  tax_amount: string;
  final_price: string;

  input_parameters: Record<string, unknown>;
  calculated_at: string;

  calculation_rules: CalculationRule[];

  items: CalculationItem[];

  rule_discounts: RuleDiscount[];

  promotion_discount: string;
}

export interface PricingCalculationListResponse {
  items: PricingCalculation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function calculatePrice(
  data: PricingCalculationRequest,
): Promise<PricingCalculation> {
  const response =
    await api.post<PricingCalculation>(
      "/api/pricing-calculations/calculate",
      data,
    );

  return response.data;
}

export async function getPricingCalculations(
  params: {
    page?: number;
    page_size?: number;
    product_id?: number;
    customer_id?: number;
    promotion_code?: string;
  } = {},
): Promise<PricingCalculationListResponse> {
  const response =
    await api.get<PricingCalculationListResponse>(
      "/api/pricing-calculations",
      {
        params,
      },
    );

  return response.data;
}

export async function getPricingCalculation(
  calculationId: number,
): Promise<PricingCalculation> {
  const response =
    await api.get<PricingCalculation>(
      `/api/pricing-calculations/${calculationId}`,
    );

  return response.data;
}