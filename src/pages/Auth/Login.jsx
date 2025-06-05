import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Enter valid credentials");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(
        `${BASE_URL}/auth/doctor/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Store token and user in localStorage for persistence
        localStorage.setItem("doctor_token", data.token);
        localStorage.setItem("doctor_user", JSON.stringify(data.user));
        localStorage.setItem("doctor_logged_in", "true");
        navigate("/dashboard");
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
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Doctor Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="input w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 items-center">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
          <button
            className="text-green-600 hover:underline"
            onClick={() => navigate("/admin/login")}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}