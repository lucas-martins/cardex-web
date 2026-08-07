import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/useAuth";

import "./LoginPage.css";
import axios from "axios";
import { AuthCard } from "../../components/authCard/AuthCard";
import { FullPageLoader } from "../../components/fullPageLoader/FullPageLoader";

export function LoginPage() {
  const navigate = useNavigate();

  const { login, authenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <FullPageLoader />;
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      await login(email.trim(), password);

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Could not sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your Pokémon TCG collection."
      footer={
        <p>
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      }
    >
      <form className="login-form" onSubmit={handleSubmit}>
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

        <label htmlFor="password">Password</label>

        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={submitting}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
