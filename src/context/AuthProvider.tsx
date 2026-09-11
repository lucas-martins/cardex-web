import { useEffect, useState, type ReactNode } from "react";

import { authService } from "../services/auth/authService";
import { authStorage } from "../utils/authStorage";
import type { LoginResponse } from "../types/auth/loginResponse";
import type { UserResponse } from "../types/auth/userResponse";
import { AuthContext } from "./AuthContext";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<UserResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = authStorage.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const authenticatedUser = await authService.me();

        setUser(authenticatedUser);
      } catch {
        authStorage.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  async function acceptSession(response: LoginResponse) {
    authStorage.saveToken(response.accessToken);

    try {
      const authenticatedUser = await authService.me();

      setUser(authenticatedUser);
    } catch (error) {
      authStorage.removeToken();
      setUser(null);

      throw error;
    }
  }

  async function login(email: string, password: string) {
    const response = await authService.login({
      email,
      password,
    });

    await acceptSession(response);
  }

  function logout() {
    authStorage.removeToken();
    setUser(null);
  }

  function updateUser(updatedUser: UserResponse) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: Boolean(user),
        loading,
        login,
        acceptSession,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
