import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
            <main className="page-container">
                <p>Loading...</p>
            </main>
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