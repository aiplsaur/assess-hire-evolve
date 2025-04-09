
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[] | "all";
  redirectTo?: string;
}

export const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // If all roles are allowed, or the user's role is in the list of allowed roles
  if (allowedRoles === "all" || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If user's role is not allowed, redirect to a forbidden page or dashboard
  return <Navigate to="/dashboard" replace />;
};
