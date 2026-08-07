import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

const mockLogin = vi.hoisted(() => vi.fn());
const mockUseAuth = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("../../context/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    error: mockToastError,
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      authenticated: false,
      loading: false,
      login: mockLogin,
      logout: vi.fn(),
    });
  });

  it("should render login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByLabelText("Email"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    ).toBeInTheDocument();
  });

  it("should login using email and password", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "lucas@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "12345678",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "lucas@example.com",
        "12345678",
      );
    });
  });

  it("should navigate to home after successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "lucas@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "12345678",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/",
        {
          replace: true,
        },
      );
    });
  });

  it("should show error when login fails", async () => {
    mockLogin.mockRejectedValue(
      new Error("Unauthorized"),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "lucas@example.com",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "wrong-password",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign in",
      }),
    );

    await waitFor(() => {
      expect(mockToastError)
        .toHaveBeenCalled();
    });
  });
});