import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    degree: "",
    contact_no: "",
    specialty: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/auth/doctor/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            access_status: "Requested",
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Doctor registered successfully.");
        navigate("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Doctor Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="input"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="degree"
            placeholder="Degree"
            className="input"
            value={form.degree}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contact_no"
            placeholder="Mobile Number"
            className="input"
            value={form.contact_no}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="specialty"
            placeholder="Speciality"
            className="input"
            value={form.specialty}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create New Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already Registered?{" "}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate("/")}
          >
            Log in here.
          </button>
        </p>
      </div>
    </div>
  );
}