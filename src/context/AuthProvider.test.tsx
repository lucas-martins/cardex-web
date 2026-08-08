import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";
import { authService } from "../services/auth/authService";
import { authStorage } from "../utils/authStorage";

vi.mock("../services/auth/authService", () => ({
  authService: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

vi.mock("../utils/authStorage", () => ({
  authStorage: {
    getToken: vi.fn(),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should finish loading when there is no stored token", async () => {
    vi.mocked(authStorage.getToken)
      .mockReturnValue(null);

    const { result } = renderHook(
      () => useAuth(),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.user).toBeNull();

    expect(authService.me).not.toHaveBeenCalled();
  });

  it("should restore the authenticated user when a token exists", async () => {
    const user = {
      id: 1,
      name: "Lucas Martins",
      email: "lucas@example.com",
      role: "USER",
    };

    vi.mocked(authStorage.getToken)
      .mockReturnValue("stored-token");

    vi.mocked(authService.me)
      .mockResolvedValue(user);

    const { result } = renderHook(
      () => useAuth(),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(user);

    expect(authService.me).toHaveBeenCalledOnce();
  });

  it("should remove an invalid stored token", async () => {
    vi.mocked(authStorage.getToken)
      .mockReturnValue("invalid-token");

    vi.mocked(authService.me)
      .mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(
      () => useAuth(),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.user).toBeNull();

    expect(authStorage.removeToken)
      .toHaveBeenCalledOnce();
  });

  it("should login and store the access token", async () => {
    const user = {
      id: 1,
      name: "Lucas Martins",
      email: "lucas@example.com",
      role: "USER",
    };

    vi.mocked(authStorage.getToken)
      .mockReturnValue(null);

    vi.mocked(authService.login)
      .mockResolvedValue({
        accessToken: "new-token",
        tokenType: "Bearer",
        expiresIn: 7200,
        id: 1,
        name: "Lucas Martins",
        email: "lucas@example.com",
        role: "USER",
      });

    vi.mocked(authService.me)
      .mockResolvedValue(user);

    const { result } = renderHook(
      () => useAuth(),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login(
        "lucas@example.com",
        "12345678",
      );
    });

    expect(authService.login)
      .toHaveBeenCalledWith({
        email: "lucas@example.com",
        password: "12345678",
      });

    expect(authStorage.saveToken)
      .toHaveBeenCalledWith("new-token");

    expect(authService.me)
      .toHaveBeenCalledOnce();

    expect(result.current.authenticated)
      .toBe(true);

    expect(result.current.user)
      .toEqual(user);
  });

  it("should logout the authenticated user", async () => {
    vi.mocked(authStorage.getToken)
      .mockReturnValue(null);

    const { result } = renderHook(
      () => useAuth(),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(authStorage.removeToken)
      .toHaveBeenCalledOnce();

    expect(result.current.authenticated)
      .toBe(false);

    expect(result.current.user)
      .toBeNull();
  });

  it("should update the current user", async () => {
  vi.mocked(authStorage.getToken)
    .mockReturnValue(null);

  const { result } = renderHook(
    () => useAuth(),
    { wrapper },
  );

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  const updatedUser = {
    id: 1,
    name: "Updated Name",
    email: "lucas@example.com",
    role: "USER",
  };

  act(() => {
    result.current.updateUser(updatedUser);
  });

  expect(result.current.user).toEqual(updatedUser);
  expect(result.current.authenticated).toBe(true);
});
});