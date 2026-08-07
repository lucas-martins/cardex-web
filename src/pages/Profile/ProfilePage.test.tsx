import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfilePage } from "./ProfilePage";

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

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
    });
  });

  it("should render user information", () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Lucas Martins"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("lucas@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("User"),
    ).toBeInTheDocument();
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

    expect(
      screen.getByText("Administrator"),
    ).toBeInTheDocument();
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

    expect(mockLogout)
      .toHaveBeenCalledOnce();

    expect(mockNavigate)
      .toHaveBeenCalledWith(
        "/login",
        {
          replace: true,
        },
      );
  });
});