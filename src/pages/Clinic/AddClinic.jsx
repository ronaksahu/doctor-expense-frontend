import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function AddClinic() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    admin_name: "",
    contact_no: "",
    additional_info: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("doctor_token");
      const res = await apiFetch(
        `${BASE_URL}/doctor/clinic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Clinic added successfully.");
        navigate("/clinic/list");
      } else {
        alert(data.message || "Failed to add clinic");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Add Clinic</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinic/Hospital Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Kirti Hospital"
              className="input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Branch Location / Address</label>
            <input
              type="text"
              name="address"
              placeholder="e.g. Ulhasnagar"
              className="input"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Admin</label>
            <input
              type="text"
              name="admin_name"
              placeholder="Admin Name"
              className="input"
              value={form.admin_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Details</label>
            <input
              type="text"
              name="contact_no"
              placeholder="e.g. 9876543210"
              className="input"
              value={form.contact_no}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows="3"
              name="additional_info"
              placeholder="Additional info..."
              className="input"
              value={form.additional_info}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Clinic"}
          </button>
        </form>
      </div>
    </div>
  );
}