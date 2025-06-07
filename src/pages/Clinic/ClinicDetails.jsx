import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function ClinicDetails() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

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
          },
          { store: 'clinics', method: 'GET' }
        );
        const data = await res.json();
        // Try to find the clinic by id in both online and offline mode
        let foundClinic = null;
        if (res.ok && data.clinic) {
          foundClinic = data.clinic;
        } else if (data.clinics && Array.isArray(data.clinics)) {
          foundClinic = data.clinics.find((c) => String(c.id) === String(id));
        } else if (Array.isArray(data) && data.length) {
          foundClinic = data.find((c) => String(c.id) === String(id));
        }
        if (foundClinic) {
          // Try to get createdAt from multiple possible fields for offline/online
          let createdAt = foundClinic.createdAt || foundClinic.created_at || foundClinic.registeredAt || foundClinic.registered_at || null;
          setClinic({ ...foundClinic, createdAt });
        } else {
          alert(data.message || "Failed to fetch clinic details");
        }
      } catch {
        alert("Network error");
      }
      setLoading(false);
    }
    fetchClinic();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Clinic not found.
      </div>
    );
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
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
          Clinic Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clinic/Hospital Name
            </label>
            <div className="input bg-gray-100">{clinic.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch Location / Address
            </label>
            <div className="input bg-gray-100">{clinic.address}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admin
            </label>
            <div className="input bg-gray-100">{clinic.admin_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Details
            </label>
            <div className="input bg-gray-100">{clinic.contact_no}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <div className="input bg-gray-100">{clinic.additional_info}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Registered Date
            </label>
            <div className="input bg-gray-100">
              {clinic.createdAt
                ? new Date(clinic.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
