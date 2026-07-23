import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth/authService";

import "./RegisterPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { authenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !passwordConfirmation
    ) {
      toast.error("Fill in all fields.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await authService.register({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      toast.success("Account created successfully.");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error("An account with this email already exists.");
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Check the information entered.");
      } else {
        toast.error("Could not create the account.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-header">
          <span className="register-brand">CardDex</span>

          <h1>Create your account</h1>

          <p>Start organizing your Pokémon TCG collection.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>

          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            disabled={submitting}
          />

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
            autoComplete="new-password"
            disabled={submitting}
          />

          <label htmlFor="passwordConfirmation">Confirm password</label>

          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
