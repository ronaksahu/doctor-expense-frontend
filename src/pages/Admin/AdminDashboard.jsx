import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchDoctors(page);
    // eslint-disable-next-line
  }, [page]);

  async function fetchDoctors(pageNum = 1) {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await apiFetch(
        `${BASE_URL}/admin/getDoctorList?page=${pageNum}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors || []);
        setTotalPages(data.totalPages || 1);
      } else {
        alert(data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      alert("Network error");
    }
    setLoading(false);
  }

  async function handleAccessStatus(doctorId, newStatus) {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await apiFetch(
        `${BASE_URL}/admin/updateDoctorAccessStatus/${doctorId}/accessStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ access_status: newStatus }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchDoctors(page);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded shadow-md p-4">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Admin Dashboard
        </h1>
        <h2 className="text-lg font-semibold mb-2">Doctor List</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No doctors found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Specialty
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Degree
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Registered Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Access Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2">{doc.name}</td>
                      <td className="px-4 py-2">{doc.specialty}</td>
                      <td className="px-4 py-2">{doc.email}</td>
                      <td className="px-4 py-2">{doc.degree}</td>
                      <td className="px-4 py-2">{doc.contact_no}</td>
                      <td className="px-4 py-2">
                        {doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            doc.access_status === "Requested"
                              ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
                              : doc.access_status === "Revoked"
                              ? "bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
                              : "bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                          }
                        >
                          {doc.access_status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {doc.access_status === "Requested" && (
                          <>
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-xs hover:bg-green-600"
                              onClick={() => handleAccessStatus(doc.id, "Granted")}
                            >
                              Approve
                            </button>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                              onClick={() => handleAccessStatus(doc.id, "Revoked")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {doc.access_status === "Granted" && (
                          <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                            onClick={() => handleAccessStatus(doc.id, "Revoked")}
                          >
                            Revoke
                          </button>
                        )}
                        {doc.access_status === "Revoked" && (
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                            onClick={() => handleAccessStatus(doc.id, "Granted")}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4 gap-2">
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
            {/* Logout Button Below Table */}
            <div className="text-center mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiFetch(
                      `${BASE_URL}/auth/doctor/logout`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          message: "Admin logged out successfully.",
                        }),
                      }
                    );
                  } catch {
                    // ignore errors
                  }
                  sessionStorage.clear();
                  localStorage.clear();
                  window.location.href = "/admin/login";
                }}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              >
                🚪 Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}