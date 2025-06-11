import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setError("");
    try {
      const res = await apiFetch(`${BASE_URL}/auth/admin/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 200) {
        setOtpSent(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Network error");
    }
    setOtpLoading(false);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`${BASE_URL}/auth/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.status === 200) {
        alert("Password changed successfully.");
        navigate("/admin/login");
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Forgot Password</h2>
        <div className="space-y-4">
          <input
            type="email"
            className="input w-full"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
            required
          />
          {!otpSent && (
            <button
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={handleSendOtp}
              disabled={otpLoading || !email}
            >
              {otpLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          )}
          {otpSent && (
            <>
              <input
                type="text"
                className="input w-full tracking-widest text-lg"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <input
                type="password"
                className="input w-full"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={handleChangePassword}
                disabled={loading || !otp || !newPassword}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </>
          )}
          {error && <div className="text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
}