import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/auth/authService";

import "./ProfilePage.css";

const roleLabel: Record<string, string> = {
  USER: "User",
  ADMIN: "Administrator",
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] =
    useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !currentPassword
      || !newPassword
      || !newPasswordConfirmation
    ) {
      toast.error("Fill in all password fields.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must have at least 8 characters.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      await authService.changePassword(
        currentPassword,
        newPassword,
      );

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");

      toast.success("Password changed successfully.");
    } catch (error) {
      if (
        axios.isAxiosError(error)
        && error.response?.status === 400
      ) {
        toast.error("Current password is incorrect.");
      } else {
        toast.error("Could not change password.");
      }
    } finally {
      setChangingPassword(false);
    }
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
            <strong>
              {roleLabel[user.role] ?? user.role}
            </strong>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h2>Change password</h2>
            <p>
              Update the password used to access your account.
            </p>
          </div>

          <form
            className="profile-password-form"
            onSubmit={handleChangePassword}
          >
            <label htmlFor="currentPassword">
              Current password
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              autoComplete="current-password"
              disabled={changingPassword}
            />

            <label htmlFor="newPassword">
              New password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              disabled={changingPassword}
            />

            <label htmlFor="newPasswordConfirmation">
              Confirm new password
            </label>

            <input
              id="newPasswordConfirmation"
              name="newPasswordConfirmation"
              type="password"
              value={newPasswordConfirmation}
              onChange={(event) =>
                setNewPasswordConfirmation(
                  event.target.value,
                )
              }
              autoComplete="new-password"
              disabled={changingPassword}
            />

            <button
              className="profile-password-button"
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing password..."
                : "Change password"}
            </button>
          </form>
        </div>

        <div className="profile-actions">
          <button
            className="profile-logout"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}