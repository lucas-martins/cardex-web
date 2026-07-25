import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./ProfilePage.css";

const roleLabel: Record<string, string> = {
  USER: "User",
  ADMIN: "Administrator",
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <header className="profile-header">
          <h1>Profile</h1>
          <p>Your account information.</p>
        </header>

        <div className="profile-info">
          <div className="profile-field">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="profile-field">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-field">
            <span>Role</span>
            <strong>{roleLabel[user.role] ?? user.role}</strong>
          </div>
        </div>

        <button className="profile-logout" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </section>
    </main>
  );
}
