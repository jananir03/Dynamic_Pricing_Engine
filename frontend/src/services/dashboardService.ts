import api from "./api";

export interface ListMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardProduct {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  base_price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardCustomer {
  id: number;
  name: string;
  email: string;
  customer_type: string;
  customer_category: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardPricingRule {
  id: number;
  name: string;
  description: string | null;
  priority: number;
  combination_type: string;
  max_discount: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conditions: unknown[];
  actions: unknown[];
}

export interface DashboardPromotion {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  minimum_purchase: string;
  maximum_discount: string | null;
  start_date: string;
  expiry_date: string;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecentCalculation {
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
  calculation_rules: unknown[];
}

interface ProductListResponse extends ListMeta {
  items: DashboardProduct[];
}

interface CategoryListResponse extends ListMeta {
  items: DashboardCategory[];
}

interface CustomerListResponse extends ListMeta {
  items: DashboardCustomer[];
}

interface PricingRuleListResponse extends ListMeta {
  items: DashboardPricingRule[];
}

interface PromotionListResponse extends ListMeta {
  items: DashboardPromotion[];
}

interface CalculationListResponse extends ListMeta {
  items: RecentCalculation[];
}

export interface DashboardStats {
  products: number;
  categories: number;
  customers: number;
  pricingRules: number;
  promotions: number;
  calculations: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentCalculations: RecentCalculation[];
}

const listCountParams = {
  page: 1,
  page_size: 1,
};

export async function getDashboardData(): Promise<DashboardData> {
  const [
    productsResponse,
    categoriesResponse,
    customersResponse,
    pricingRulesResponse,
    promotionsResponse,
    calculationsResponse,
  ] = await Promise.all([
    api.get<ProductListResponse>("/api/products", {
      params: listCountParams,
    }),

    api.get<CategoryListResponse>("/api/categories", {
      params: listCountParams,
    }),

    api.get<CustomerListResponse>("/api/customers", {
      params: listCountParams,
    }),

    api.get<PricingRuleListResponse>("/api/pricing-rules", {
      params: listCountParams,
    }),

    api.get<PromotionListResponse>("/api/promotions", {
      params: listCountParams,
    }),

    api.get<CalculationListResponse>(
      "/api/pricing-calculations",
      {
        params: {
          page: 1,
          page_size: 5,
        },
      },
    ),
  ]);

  return {
    stats: {
      products: productsResponse.data.total,
      categories: categoriesResponse.data.total,
      customers: customersResponse.data.total,
      pricingRules: pricingRulesResponse.data.total,
      promotions: promotionsResponse.data.total,
      calculations: calculationsResponse.data.total,
    },

    recentCalculations:
      calculationsResponse.data.items,
  };
}