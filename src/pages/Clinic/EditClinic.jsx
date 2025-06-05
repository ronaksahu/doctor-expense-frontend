import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function EditClinic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    admin_name: "",
    contact_no: "",
    additional_info: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchClinic() {
      setLoading(true);
      try {
        const token = localStorage.getItem("doctor_token");
        const res = await apiFetch(
          `${BASE_URL}/doctor/getClinicList?id=${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.clinic) {
          setForm({
            name: data.clinic.name || "",
            address: data.clinic.address || "",
            admin_name: data.clinic.admin_name || "",
            additional_info: data.clinic.additional_info || "",
            contact_no: data.clinic.contact_no || "",
          });
        } else {
          alert(data.message || "Failed to fetch clinic details");
          navigate("/clinic/list");
        }
      } catch (err) {
        alert("Network error");
        navigate("/clinic/list");
      }
      setLoading(false);
    }
    fetchClinic();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("doctor_token");
      const res = await apiFetch(
        `${BASE_URL}/doctor/clinic/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Clinic updated successfully.");
        navigate("/clinic/list");
      } else {
        alert(data.message || "Failed to update clinic");
      }
    } catch (err) {
      alert("Network error");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <button
          className="mb-4 text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          ← Back to Clinic List
        </button>
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Edit Clinic</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinic/Hospital Name</label>
            <input
              type="text"
              name="name"
              className="input bg-gray-100 cursor-not-allowed"
              value={form.name}
              disabled
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
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Clinic"}
          </button>
        </form>
      </div>
    </div>
  );
}
