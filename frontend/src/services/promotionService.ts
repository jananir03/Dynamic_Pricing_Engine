import api from "./api";

export type DiscountType =
  | "PERCENTAGE"
  | "FIXED";

export interface Promotion {
  id: number;
  code: string;
  discount_type: DiscountType;
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

export interface PromotionListResponse {
  items: Promotion[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PromotionCreateRequest {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  minimum_purchase: string;
  maximum_discount: string | null;
  start_date: string;
  expiry_date: string;
  usage_limit: number | null;
}

export interface PromotionUpdateRequest {
  code?: string;
  discount_type?: DiscountType;
  discount_value?: string;
  minimum_purchase?: string;
  maximum_discount?: string | null;
  start_date?: string;
  expiry_date?: string;
  usage_limit?: number | null;
}

export interface PromotionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  discount_type?: DiscountType;
  sort_by?:
    | "id"
    | "code"
    | "discount_value"
    | "start_date"
    | "expiry_date"
    | "usage_count"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
}

export async function getPromotions(
  params: PromotionListParams = {},
): Promise<PromotionListResponse> {
  const response =
    await api.get<PromotionListResponse>(
      "/api/promotions",
      {
        params,
      },
    );

  return response.data;
}

export async function getPromotion(
  promotionId: number,
): Promise<Promotion> {
  const response =
    await api.get<Promotion>(
      `/api/promotions/${promotionId}`,
    );

  return response.data;
}

export async function getPromotionByCode(
  code: string,
): Promise<Promotion> {
  const response =
    await api.get<Promotion>(
      `/api/promotions/code/${encodeURIComponent(code)}`,
    );

  return response.data;
}

export async function createPromotion(
  data: PromotionCreateRequest,
): Promise<Promotion> {
  const response =
    await api.post<Promotion>(
      "/api/promotions",
      data,
    );

  return response.data;
}

export async function updatePromotion(
  promotionId: number,
  data: PromotionUpdateRequest,
): Promise<Promotion> {
  const response =
    await api.put<Promotion>(
      `/api/promotions/${promotionId}`,
      data,
    );

  return response.data;
}

export async function updatePromotionStatus(
  promotionId: number,
  isActive: boolean,
): Promise<Promotion> {
  const response =
    await api.patch<Promotion>(
      `/api/promotions/${promotionId}/status`,
      {
        is_active: isActive,
      },
    );

  return response.data;
}

export async function deletePromotion(
  promotionId: number,
): Promise<void> {
  await api.delete(
    `/api/promotions/${promotionId}`,
  );
}