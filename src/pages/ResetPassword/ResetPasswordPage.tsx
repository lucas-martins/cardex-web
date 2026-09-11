import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/auth/authService";
import { AuthCard } from "../../components/authCard/AuthCard";
import { FullPageLoader } from "../../components/fullPageLoader/FullPageLoader";

import "./ResetPasswordPage.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authenticated, loading } = useAuth();

  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <FullPageLoader />;
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing or invalid.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must have at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await authService.resetPassword(token, newPassword);

      toast.success("Password reset successfully. You can sign in now.");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("This reset link is invalid or has expired.");
      } else {
        toast.error("Could not reset password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <p>
          Back to <Link to="/login">sign in</Link>
        </p>
      }
    >
      {!token ? (
        <div className="reset-password-missing">
          <p>This reset link is missing a token.</p>

          <Link to="/forgot-password">Request a new reset link</Link>
        </div>
      ) : (
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New password</label>

          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />

          <label htmlFor="confirmPassword">Confirm password</label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
