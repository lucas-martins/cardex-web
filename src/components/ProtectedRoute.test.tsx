import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ProtectedRoute } from "./ProtectedRoute";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("../context/useAuth", () => ({
  useAuth: mockUseAuth,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show the loader while authentication is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      authenticated: false,
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Loading your collection..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected content"),
    ).not.toBeInTheDocument();
  });

  it("should render protected content when authenticated", () => {
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
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Protected content"),
    ).toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      authenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/collection"]}>
        <Routes>
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={<div>Login page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Login page"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected content"),
    ).not.toBeInTheDocument();
  });
});