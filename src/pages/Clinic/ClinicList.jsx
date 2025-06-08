import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
import { getAllFromStore, clearStore, putToStore } from "../../utils/db";

export default function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const limit = 10;
  const navigate = useNavigate();
  const didFetchRef = useRef(false);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchClinics = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("doctor_token");
      let res, data;
      if (isOnline) {
        res = await apiFetch(
          `${BASE_URL}/doctor/getClinicList?page=${pageNum}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        data = await res.json();
        // API returns clinics list under data.clinics.clinics
        const clinicsArr = Array.isArray(data?.clinics?.clinics) ? data.clinics.clinics : [];
        setClinics(clinicsArr);
        // Save to IndexedDB for offline use
        await clearStore('clinics');
        for (const c of clinicsArr) await putToStore('clinics', c);
      } else {
        // Offline: load from IndexedDB
        const all = await getAllFromStore('clinics');
        setClinics(Array.isArray(all) ? all : []);
      }
    } catch {
      setClinics([]);
    }
    setLoading(false);
  }, [isOnline, limit]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchClinics(page);
  }, [page, fetchClinics]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
        Clinic List
      </h2>
      {!isOnline && (
        <div className="text-center text-red-500 mb-4">You are offline. Add/Edit/Delete actions are disabled.</div>
      )}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <>
          <div className="space-y-4 max-w-3xl mx-auto">
            {clinics.map((clinic, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">
                  {clinic.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Branch: {clinic.address}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                    onClick={() => isOnline && navigate(`/clinic/edit/${clinic.id}`)}
                    disabled={!isOnline}
                  >
                    ✏️ Edit Clinic
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    onClick={() => isOnline && navigate("/expenses/add?clinic_id=" + clinic.id)}
                    disabled={!isOnline}
                  >
                    ➕ Add Expense
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={() => navigate(`/clinic/details/${clinic.id}`)}
                  >
                    📄 View Details
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    style={{ marginLeft: 'auto' }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!isOnline) return;
                      if (window.confirm(`Delete clinic '${clinic.name}'?`)) {
                        try {
                          const token = localStorage.getItem("doctor_token");
                          const res = await apiFetch(
                            `${BASE_URL}/doctor/clinic/${clinic.id}`,
                            {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (res.ok) {
                            setClinics((prev) => prev.filter((c) => c.id !== clinic.id));
                          } else {
                            alert("Failed to delete clinic");
                          }
                        } catch {
                          alert("Network error");
                        }
                      }
                    }}
                    disabled={!isOnline}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-2 text-sm">
              Page {page}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
