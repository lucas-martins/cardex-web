import { createContext } from "react";

import type { UserResponse } from "../types/auth/userResponse";

export interface AuthContextData {
  user: UserResponse | null;
  authenticated: boolean;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  updateUser(user: UserResponse): void;
}

export const AuthContext =
  createContext<AuthContextData | null>(null);