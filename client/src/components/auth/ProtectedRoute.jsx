// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute component ensures only authenticated users
 * can access protected pages. It checks for a JWT token stored
 * in localStorage. If no token is found, the user is redirected
 * to the /login page.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token found → redirect to login
    return <Navigate to="/login" replace />;
  }

  // Token exists → render nested protected route
  return <Outlet />;
};

export default ProtectedRoute;
