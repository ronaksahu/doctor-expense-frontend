import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      fetchClinics(page, true); // refetch from server when back online
    }
    function handleOffline() {
      setIsOnline(false);
      fetchClinics(page, false); // refetch from cache when offline
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [page]); // Added 'page' to dependency array

  // Only one useEffect needed: always fetch on mount and when page or isOnline changes
  useEffect(() => {
    fetchClinics(page, isOnline);
  }, [page, isOnline]);

  async function fetchClinics(pageNum = 1, online = navigator.onLine) {
    setLoading(true);
    try {
      const token = localStorage.getItem("doctor_token");
      let res, data;
      if (online) {
        res = await apiFetch(
          `${BASE_URL}/doctor/getClinicList?page=${pageNum}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
          { store: 'clinics', method: 'GET' }
        );
        data = await res.json();
        if (!res.ok) {
          const cached = await apiFetch('', {}, { store: 'clinics', method: 'GET' });
          const cachedData = await cached.json();
          setClinics(Array.isArray(cachedData.clinics) ? cachedData.clinics : []);
          setTotalPages(1);
          setLoading(false);
          return;
        }
      } else {
        res = await apiFetch('', {}, { store: 'clinics', method: 'GET' });
        data = await res.json();
      }
      // Always extract clinics array from data
      let clinicsArr = [];
      if (Array.isArray(data.clinics)) {
        clinicsArr = data.clinics;
      } else if (Array.isArray(data)) {
        clinicsArr = data;
      } else if (data.clinics && Array.isArray(data.clinics.clinics)) {
        clinicsArr = data.clinics.clinics;
      }
      clinicsArr = clinicsArr.filter(c => c && c.id && c.name);
      setClinics(clinicsArr);
      setTotalPages(1);
    } catch {
      // On error, fallback to cache if offline, else show empty
      if (!online) {
        const cached = await apiFetch('', {}, { store: 'clinics', method: 'GET' });
        const cachedData = await cached.json();
        setClinics(Array.isArray(cachedData.clinics) ? cachedData.clinics : []);
        setTotalPages(1);
      } else {
        setClinics([]);
        setTotalPages(1);
        alert("Network error");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
        Clinic List
      </h2>
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
                    onClick={() => navigate(`/clinic/edit/${clinic.id}`)}
                  >
                    ✏️ Edit Clinic
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    onClick={() => navigate("/expenses/add")}
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
                            },
                            { store: 'clinics', method: 'DELETE', data: { id: clinic.id } }
                          );
                          if (res.ok) {
                            setClinics((prev) => prev.filter((c) => c.id !== clinic.id));
                          } else {
                            const data = await res.json();
                            if (data.offline) {
                              setClinics((prev) => prev.filter((c) => c.id !== clinic.id));
                              alert("Clinic deleted offline. Will sync when online.");
                            } else {
                              alert("Failed to delete clinic");
                            }
                          }
                        } catch {
                          alert("Network error");
                        }
                      }
                    }}
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
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
