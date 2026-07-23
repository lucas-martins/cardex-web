import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./MainLayout.css";

export function MainLayout() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="main-layout">
      <header className="main-header">
        <NavLink className="brand" to="/">
          CardDex
        </NavLink>

        <nav className="main-navigation">
          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/"
          >
            Home
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/collection"
          >
            My Collection
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/search"
          >
            Search Cards
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/wishlist"
          >
            Wishlist
          </NavLink>
        </nav>

        <div className="header-user">
          <span className="header-username">{user?.name}</span>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
