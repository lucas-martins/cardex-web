import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./MainLayout.css";
import { useAuth } from "../context/useAuth";
import { ThemeToggle } from "../components/theme/ThemeToggle";

export function MainLayout() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [navOpen, setNavOpen] = useState(false);

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="main-header-top">
          <NavLink className="brand" to="/" onClick={closeNav}>
            CardDex
          </NavLink>

          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`main-navigation${navOpen ? " open" : ""}`}>
          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/"
            onClick={closeNav}
          >
            Home
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/collection"
            onClick={closeNav}
          >
            My Collection
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/collections"
            onClick={closeNav}
          >
            Collections
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/search"
            onClick={closeNav}
          >
            Search Cards
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/wishlist"
            onClick={closeNav}
          >
            Wishlist
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              isActive ? "navigation-link active" : "navigation-link"
            }
            to="/history"
            onClick={closeNav}
          >
            History
          </NavLink>
        </nav>

        <div className="header-user">
          <ThemeToggle />
          <NavLink className="header-username" to="/profile" onClick={closeNav}>
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
