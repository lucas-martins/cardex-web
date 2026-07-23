import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/auth/authService";
import { authStorage } from "../utils/authStorage";
import type { UserResponse } from "../types/auth/userResponse";

interface AuthContextData {
  user: UserResponse | null;
  authenticated: boolean;
  loading: boolean;

  login(username: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextData | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!authStorage.hasToken()) {
        setLoading(false);
        return;
      }

      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        authStorage.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email: string, password: string) {
    const response = await authService.login({
      email,
      password,
    });

    authStorage.saveToken(response.accessToken);

    const me = await authService.me();

    setUser(me);
    setLoading(false);
  }

  function logout() {
    authStorage.removeToken();
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
