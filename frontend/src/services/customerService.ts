import api from "./api";

export type CustomerType =
  | "REGULAR"
  | "PREMIUM"
  | "BUSINESS"
  | "WHOLESALE";

export interface Customer {
  id: number;
  name: string;
  email: string;
  customer_type: CustomerType;
  customer_category: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  customer_type: CustomerType;
  customer_category: string | null;
  location: string | null;
}

export interface CustomerUpdateRequest {
  name?: string;
  email?: string;
  customer_type?: CustomerType;
  customer_category?: string | null;
  location?: string | null;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  customer_type?: CustomerType;
  customer_category?: string;
  location?: string;
  is_active?: boolean;
  sort_by?:
    | "id"
    | "name"
    | "email"
    | "customer_type"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
}

export async function getCustomers(
  params: CustomerListParams = {},
): Promise<CustomerListResponse> {
  const response =
    await api.get<CustomerListResponse>(
      "/api/customers",
      {
        params,
      },
    );

  return response.data;
}

export async function getCustomer(
  customerId: number,
): Promise<Customer> {
  const response =
    await api.get<Customer>(
      `/api/customers/${customerId}`,
    );

  return response.data;
}

export async function createCustomer(
  data: CustomerCreateRequest,
): Promise<Customer> {
  const response =
    await api.post<Customer>(
      "/api/customers",
      data,
    );

  return response.data;
}

export async function updateCustomer(
  customerId: number,
  data: CustomerUpdateRequest,
): Promise<Customer> {
  const response =
    await api.put<Customer>(
      `/api/customers/${customerId}`,
      data,
    );

  return response.data;
}

export async function updateCustomerStatus(
  customerId: number,
  isActive: boolean,
): Promise<Customer> {
  const response =
    await api.patch<Customer>(
      `/api/customers/${customerId}/status`,
      {
        is_active: isActive,
      },
    );

  return response.data;
}

export async function deleteCustomer(
  customerId: number,
): Promise<void> {
  await api.delete(
    `/api/customers/${customerId}`,
  );
}