import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageLoader } from "./fullPageLoader/FullPageLoader";


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