/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, requiredRole }) {
  // TODO: Replace with actual authentication check
  const isAuthenticated = true; // Placeholder
  const userRole = "admin"; // Placeholder - should come from auth context

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
