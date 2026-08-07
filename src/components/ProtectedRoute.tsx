import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullPageLoader } from "./fullPageLoader/FullPageLoader";
import { useAuth } from "../context/useAuth";


interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    authenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <FullPageLoader message="Loading your collection..." />
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}