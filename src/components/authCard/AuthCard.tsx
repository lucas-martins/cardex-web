import type { ReactNode } from "react";

import "./AuthCard.css";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="auth-brand">
            CardDex
          </span>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>

        {children}

        {footer && (
          <div className="auth-footer">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}