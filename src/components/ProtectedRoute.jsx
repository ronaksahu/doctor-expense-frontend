// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("doctor_logged_in") === "true";

  return isLoggedIn ? children : <Navigate to="/" />;
}
