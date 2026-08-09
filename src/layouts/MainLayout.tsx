import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "./MainLayout.css";
import { useAuth } from "../context/useAuth";

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

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/history"
          >
            History
          </NavLink>
        </nav>

        <div className="header-user">
          <NavLink className="header-username" to="/profile">
            {user?.name}
          </NavLink>
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
