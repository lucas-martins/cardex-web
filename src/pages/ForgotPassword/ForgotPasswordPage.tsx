import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/auth/authService";
import { AuthCard } from "../../components/authCard/AuthCard";
import { FullPageLoader } from "../../components/fullPageLoader/FullPageLoader";

import "./ForgotPasswordPage.css";

export function ForgotPasswordPage() {
  const { authenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return <FullPageLoader />;
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Enter your email.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await authService.forgotPassword(normalizedEmail);

      setSubmitted(true);
      setResetToken(response.resetToken || null);

      toast.success(
        "If an account exists for that email, password reset instructions were sent.",
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Check the email entered.");
      } else {
        toast.error("Could not start password reset. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email to receive a password reset link."
      footer={
        <p>
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {submitted ? (
        <div className="forgot-password-success">
          <p>
            If an account exists for that email, password reset instructions
            were sent.
          </p>

          {resetToken && (
            <div className="forgot-password-token">
              <p>
                Development reset token (email delivery is not configured
                yet):
              </p>

              <code>{resetToken}</code>

              <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
                Continue to reset password
              </Link>
            </div>
          )}

          <Link className="forgot-password-back" to="/login">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={submitting}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
