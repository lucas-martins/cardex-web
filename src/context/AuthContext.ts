import { createContext } from "react";

import type { LoginResponse } from "../types/auth/loginResponse";
import type { UserResponse } from "../types/auth/userResponse";

export interface AuthContextData {
  user: UserResponse | null;
  authenticated: boolean;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  acceptSession(response: LoginResponse): Promise<void>;
  logout(): void;
  updateUser(user: UserResponse): void;
}

export const AuthContext =
  createContext<AuthContextData | null>(null);
