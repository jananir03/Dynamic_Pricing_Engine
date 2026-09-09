import api from "./api";

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  base_price: string | number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductCreateRequest {
  category_id: number;
  name: string;
  description: string | null;
  sku: string;
  base_price: number;
}

export interface ProductUpdateRequest {
  category_id?: number;
  name?: string;
  description?: string | null;
  sku?: string;
  base_price?: number;
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?:
    | "id"
    | "name"
    | "sku"
    | "base_price"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  const response =
    await api.get<ProductListResponse>(
      "/api/products",
      {
        params,
      },
    );

  return response.data;
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  const response =
    await api.get<Product>(
      `/api/products/${productId}`,
    );

  return response.data;
}

export async function createProduct(
  data: ProductCreateRequest,
): Promise<Product> {
  const response =
    await api.post<Product>(
      "/api/products",
      data,
    );

  return response.data;
}

export async function updateProduct(
  productId: number,
  data: ProductUpdateRequest,
): Promise<Product> {
  const response =
    await api.put<Product>(
      `/api/products/${productId}`,
      data,
    );

  return response.data;
}

export async function updateProductStatus(
  productId: number,
  isActive: boolean,
): Promise<Product> {
  const response =
    await api.patch<Product>(
      `/api/products/${productId}/status`,
      {
        is_active: isActive,
      },
    );

  return response.data;
}

export async function deleteProduct(
  productId: number,
): Promise<void> {
  await api.delete(
    `/api/products/${productId}`,
  );
}