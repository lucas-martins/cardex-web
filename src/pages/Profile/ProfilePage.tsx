import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/auth/authService";
import {
  disableShare,
  enableShare,
  getShareStatus,
} from "../../services/share/shareService";
import type { ShareStatus } from "../../types/share";

import "./ProfilePage.css";

const roleLabel: Record<string, string> = {
  USER: "User",
  ADMIN: "Administrator",
};

export function ProfilePage() {
  const navigate = useNavigate();

  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [loadingShare, setLoadingShare] = useState(true);
  const [updatingShare, setUpdatingShare] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadShareStatus() {
      try {
        setLoadingShare(true);

        const status = await getShareStatus();

        if (active) {
          setShareStatus(status);
        }
      } catch {
        if (active) {
          toast.error("Could not load share settings.");
        }
      } finally {
        if (active) {
          setLoadingShare(false);
        }
      }
    }

    void loadShareStatus();

    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return null;
  }

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const updatedUser = await authService.updateProfile(normalizedName);

      updateUser(updatedUser);

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      toast.error("Fill in all password fields.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must have at least 8 characters.");
      return;
    }

    try {
      setChangingPassword(true);

      await authService.changePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");

      toast.success("Password changed successfully.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Current password is incorrect.");
      } else {
        toast.error("Could not change password.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  function getShareLink(status: ShareStatus) {
    if (status.shareUrl) {
      if (status.shareUrl.startsWith("http")) {
        return status.shareUrl;
      }

      return `${window.location.origin}${status.shareUrl}`;
    }

    if (status.shareToken) {
      return `${window.location.origin}/share/${status.shareToken}`;
    }

    return null;
  }

  async function handleEnableShare() {
    try {
      setUpdatingShare(true);

      const status = await enableShare();

      setShareStatus(status);

      toast.success("Collection sharing enabled.");
    } catch {
      toast.error("Could not enable collection sharing.");
    } finally {
      setUpdatingShare(false);
    }
  }

  async function handleDisableShare() {
    try {
      setUpdatingShare(true);

      await disableShare();

      setShareStatus({
        enabled: false,
        shareToken: null,
        shareUrl: null,
      });

      toast.success("Collection sharing disabled.");
    } catch {
      toast.error("Could not disable collection sharing.");
    } finally {
      setUpdatingShare(false);
    }
  }

  async function handleCopyShareLink() {
    if (!shareStatus) {
      return;
    }

    const link = getShareLink(shareStatus);

    if (!link) {
      toast.error("Share link is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not copy share link.");
    }
  }

  const shareLink = shareStatus ? getShareLink(shareStatus) : null;

  return (
    <main className="profile-page">
      <section className="profile-card">
        <header className="profile-header">
          <h1>Profile</h1>
          <p>Your account information.</p>
        </header>

        <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
          <label htmlFor="profileName">Name</label>

          <input
            id="profileName"
            name="profileName"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={savingProfile}
          />

          <button
            type="submit"
            disabled={savingProfile || name.trim() === user.name}
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="profile-info">
          <div className="profile-field">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-field">
            <span>Role</span>
            <strong>{roleLabel[user.role] ?? user.role}</strong>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h2>Share collection</h2>
            <p>
              Create a public link so others can view your collection progress.
            </p>
          </div>

          {loadingShare ? (
            <p className="profile-share-message">Loading share settings...</p>
          ) : (
            <div className="profile-share">
              <p className="profile-share-status">
                Status:{" "}
                <strong>
                  {shareStatus?.enabled ? "Enabled" : "Disabled"}
                </strong>
              </p>

              {shareStatus?.enabled && shareLink && (
                <div className="profile-share-link">
                  <label htmlFor="shareLink">Share link</label>

                  <div className="profile-share-link-row">
                    <input
                      id="shareLink"
                      type="text"
                      value={shareLink}
                      readOnly
                    />

                    <button
                      type="button"
                      onClick={() => {
                        void handleCopyShareLink();
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="profile-share-actions">
                {shareStatus?.enabled ? (
                  <button
                    type="button"
                    className="profile-share-disable"
                    disabled={updatingShare}
                    onClick={() => {
                      void handleDisableShare();
                    }}
                  >
                    {updatingShare ? "Disabling..." : "Disable sharing"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="profile-share-enable"
                    disabled={updatingShare}
                    onClick={() => {
                      void handleEnableShare();
                    }}
                  >
                    {updatingShare ? "Enabling..." : "Enable sharing"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h2>Change password</h2>
            <p>Update the password used to access your account.</p>
          </div>

          <form
            className="profile-password-form"
            onSubmit={handleChangePassword}
          >
            <label htmlFor="currentPassword">Current password</label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              disabled={changingPassword}
            />

            <label htmlFor="newPassword">New password</label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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
                setNewPasswordConfirmation(event.target.value)
              }
              autoComplete="new-password"
              disabled={changingPassword}
            />

            <button
              className="profile-password-button"
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword ? "Changing password..." : "Change password"}
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
