import { NavLink, Outlet } from "react-router-dom";
import "./MainLayout.css";

export function MainLayout() {
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
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
