import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfilePage } from "./ProfilePage";

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());
const mockChangePassword = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());

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

vi.mock("../../services/auth/authService", () => ({
  authService: {
    changePassword: mockChangePassword,
    updateProfile: mockUpdateUser,
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Lucas Martins",
        email: "lucas@example.com",
        role: "USER",
      },
      authenticated: true,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      updateUser: mockUpdateUser,
    });

    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Lucas Martins",
        email: "lucas@example.com",
        role: "USER",
      },
      authenticated: true,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
      updateUser: mockUpdateUser,
    });
  });

  it("should render user information", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Lucas Martins");

    expect(screen.getByText("lucas@example.com")).toBeInTheDocument();

    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("should render administrator role label", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 2,
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
      authenticated: true,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("should return nothing when there is no user", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      authenticated: false,
      loading: false,
      login: vi.fn(),
      logout: mockLogout,
    });

    const { container } = render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should logout and navigate to login", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign out",
      }),
    );

    expect(mockLogout).toHaveBeenCalledOnce();

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      replace: true,
    });
  });

  it("should change password successfully", async () => {
    mockChangePassword.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: {
        value: "12345678",
      },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: {
        value: "new-password",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: {
        value: "new-password",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change password",
      }),
    );

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        "12345678",
        "new-password",
      );
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Password changed successfully.",
    );
  });

  it("should not change password when fields are empty", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change password",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Fill in all password fields.",
      );
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("should not change password when confirmation does not match", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: {
        value: "12345678",
      },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: {
        value: "new-password",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: {
        value: "different-password",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change password",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "New passwords do not match.",
      );
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("should reject a new password shorter than eight characters", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: {
        value: "12345678",
      },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: {
        value: "1234567",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: {
        value: "1234567",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change password",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "New password must have at least 8 characters.",
      );
    });

    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("should update profile name successfully", async () => {
    const updatedUser = {
      id: 1,
      name: "Lucas Updated",
      email: "lucas@example.com",
      role: "USER",
    };

    mockUpdateUser.mockResolvedValue(updatedUser);

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: {
        value: "  Lucas Updated  ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith("Lucas Updated");
    });

    expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Profile updated successfully.",
    );
  });

  it("should not update profile when name is empty", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: {
        value: "   ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Name is required.");
    });

    expect(mockUpdateUser).not.toHaveBeenCalled();

    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
  it("should show error when profile update fails", async () => {
    mockUpdateUser.mockRejectedValue(new Error("Update failed"));

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: {
        value: "New Name",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save changes",
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Could not update profile.");
    });
  });
});
