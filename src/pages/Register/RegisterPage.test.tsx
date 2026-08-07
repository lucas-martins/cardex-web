import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterPage } from "./RegisterPage";

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockRegister = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());

vi.mock("../../context/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("../../services/auth/authService", () => ({
  authService: {
    register: mockRegister,
  },
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
    success: mockToastSuccess,
  },
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      authenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("should render register form", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByLabelText("Name"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Confirm password"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create account",
      }),
    ).toBeInTheDocument();
  });

  it("should show error when required fields are empty", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    await waitFor(() => {
      expect(mockToastError)
        .toHaveBeenCalledWith("Fill in all fields.");
    });

    expect(mockRegister)
      .not.toHaveBeenCalled();
  });

  it("should show error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Name"),
      {
        target: {
          value: "Lucas Martins",
        },
      },
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

    fireEvent.change(
      screen.getByLabelText("Confirm password"),
      {
        target: {
          value: "87654321",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    await waitFor(() => {
      expect(mockToastError)
        .toHaveBeenCalledWith("Passwords do not match.");
    });

    expect(mockRegister)
      .not.toHaveBeenCalled();
  });

  it("should register user and navigate to login", async () => {
    mockRegister.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Name"),
      {
        target: {
          value: " Lucas Martins ",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: " lucas@example.com ",
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

    fireEvent.change(
      screen.getByLabelText("Confirm password"),
      {
        target: {
          value: "12345678",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    await waitFor(() => {
      expect(mockRegister)
        .toHaveBeenCalledWith({
          name: "Lucas Martins",
          email: "lucas@example.com",
          password: "12345678",
        });
    });

    expect(mockToastSuccess)
      .toHaveBeenCalledWith(
        "Account created successfully.",
      );

    expect(mockNavigate)
      .toHaveBeenCalledWith(
        "/login",
        {
          replace: true,
        },
      );
  });

  it("should show error when registration fails", async () => {
    mockRegister.mockRejectedValue(
      new Error("Registration failed"),
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByLabelText("Name"),
      {
        target: {
          value: "Lucas Martins",
        },
      },
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

    fireEvent.change(
      screen.getByLabelText("Confirm password"),
      {
        target: {
          value: "12345678",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    await waitFor(() => {
      expect(mockToastError)
        .toHaveBeenCalledWith(
          "Could not create the account.",
        );
    });
  });
});