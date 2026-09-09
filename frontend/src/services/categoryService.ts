import api from "./api";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CategoryCreateRequest {
  name: string;
  description: string | null;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string | null;
}

export interface CategoryStatusUpdateRequest {
  is_active: boolean;
}

export interface CategoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: "id" | "name" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

export async function getCategories(
  params: CategoryListParams = {},
): Promise<CategoryListResponse> {
  const response =
    await api.get<CategoryListResponse>(
      "/api/categories",
      {
        params,
      },
    );

  return response.data;
}

export async function getCategory(
  categoryId: number,
): Promise<Category> {
  const response =
    await api.get<Category>(
      `/api/categories/${categoryId}`,
    );

  return response.data;
}

export async function createCategory(
  data: CategoryCreateRequest,
): Promise<Category> {
  const response =
    await api.post<Category>(
      "/api/categories",
      data,
    );

  return response.data;
}

export async function updateCategory(
  categoryId: number,
  data: CategoryUpdateRequest,
): Promise<Category> {
  const response =
    await api.put<Category>(
      `/api/categories/${categoryId}`,
      data,
    );

  return response.data;
}

export async function updateCategoryStatus(
  categoryId: number,
  isActive: boolean,
): Promise<Category> {
  const response =
    await api.patch<Category>(
      `/api/categories/${categoryId}/status`,
      {
        is_active: isActive,
      },
    );

  return response.data;
}

export async function deleteCategory(
  categoryId: number,
): Promise<void> {
  await api.delete(
    `/api/categories/${categoryId}`,
  );
}