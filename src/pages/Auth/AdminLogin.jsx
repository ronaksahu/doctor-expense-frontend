import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
l
export default function AdminLogin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
       const res = await apiFetch(
              `${BASE_URL}/auth/admin/signin`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": admin, password }),
              }
            );
      const data = await res.json();
      if (res.ok) {
        // Store token and user info as needed
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Admin Login</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="text"
            className="input w-full"
            placeholder="Admin"
            value={admin}
            onChange={(e) => setAdmin(e.target.value)}
            required
          />
          <input
            type="password"
            className="input w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate("/")}
          >
            Doctor Login
          </button>
        </div>
      </div>
    </div>
  );
}