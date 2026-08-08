import { apiClient } from "../api/apiClient";
import type { LoginRequest } from "../../types/auth/loginRequest";
import type { LoginResponse } from "../../types/auth/loginResponse";
import type { RegisterRequest } from "../../types/auth/registerRequest";
import type { UserResponse } from "../../types/auth/userResponse";

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      request,
    );

    return response.data;
  },

  async register(request: RegisterRequest): Promise<void> {
    await apiClient.post("/auth/register", request);
  },

  async me(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>("/auth/me");

    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await apiClient.put("/auth/me/password", {
      currentPassword,
      newPassword,
    });
  },

  async updateProfile(name: string): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>("/auth/me", {
      name,
    });

    return response.data;
  },
};
