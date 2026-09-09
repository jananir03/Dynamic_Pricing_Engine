import api from "./api";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const registerUser = async (
  data: RegisterRequest,
): Promise<void> => {
  await api.post("/api/auth/register", data);
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<TokenResponse> => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post<TokenResponse>(
    "/api/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

export const getCurrentUser = async (
  token: string,
): Promise<User> => {
  const response = await api.get<User>("/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};