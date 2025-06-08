import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
import { getAllFromStore, clearStore, putToStore } from "../../utils/db";

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const didFetchRef = useRef(false);

  const fetchExpenses = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("doctor_token");
      let res, data;
      if (isOnline) {
        res = await apiFetch(
          `${BASE_URL}/doctor/expense?page=${pageNum}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        data = await res.json();
        // If API returns nested structure, extract expenses array
        const expensesArr = Array.isArray(data?.expenses?.expenses) ? data.expenses.expenses : (Array.isArray(data?.expenses) ? data.expenses : []);
        // --- Add clinic_name to each expense before saving to IndexedDB ---
        let clinicsMap = {};
        try {
          const clinics = await getAllFromStore('clinics');
          clinicsMap = (clinics || []).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
        } catch { /* ignore */ }
        const expensesWithClinicName = expensesArr.map(e => ({
          ...e,
          clinic_name: e.clinic_name || clinicsMap[e.clinic_id] || ''
        }));
        setExpenses(expensesWithClinicName);
        // Save to IndexedDB for offline use
        await clearStore('expenses');
        for (const e of expensesWithClinicName) await putToStore('expenses', e);
      } else {
        // Offline: load from IndexedDB
        const all = await getAllFromStore('expenses');
        setExpenses(Array.isArray(all) ? all : []);
      }
    } catch {
      setExpenses([]);
    }
    setLoading(false);
  }, [isOnline, limit]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchExpenses(page);
  }, [page, fetchExpenses]);

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

  const [showCollectForm, setShowCollectForm] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [currentPayments, setCurrentPayments] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [collectedDate, setCollectedDate] = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");

  const openCollectForm = (id) => {
    setCurrentId(id);
    setShowCollectForm(true);
  };

  const openPaymentsModal = async (payments, expenseId) => {
    if (isOnline) {
      setCurrentPayments(payments || []);
      setShowPaymentsModal(true);
    } else {
      // Offline: get payments for this expense from IndexedDB
      try {
        const allPayments = await getAllFromStore('payments');
        const filtered = (allPayments || []).filter(p => String(p.expense_id) === String(expenseId));
        setCurrentPayments(filtered);
        setShowPaymentsModal(true);
      } catch {
        setCurrentPayments([]);
        setShowPaymentsModal(true);
      }
    }
  };

  const handleCollectSave = async () => {
    if (!collectedDate || !additionalAmount) {
      alert("Please fill both fields");
      return;
    }
    try {
      const token = localStorage.getItem("doctor_token");
      const res = await apiFetch(
        `${BASE_URL}/doctor/expense/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: collectedDate,
            amount: parseFloat(additionalAmount),
            expenseId: currentId,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Payment added successfully.");
        setShowCollectForm(false);
        setCurrentId(null);
        setCollectedDate("");
        setAdditionalAmount("");
        fetchExpenses(page);
      } else {
        alert(data.message || "Failed to add payment");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        const token = localStorage.getItem("doctor_token");
        const res = await apiFetch(
          `${BASE_URL}/doctor/expense/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          alert("Expense deleted successfully.");
          setExpenses(expenses.filter((e) => e.id !== id));
        } else {
          alert(data.message || "Failed to delete expense");
        }
      } catch {
        alert("Network error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
        Expense Records
      </h2>
      {!isOnline && (
        <div className="text-center text-red-500 mb-4">You are offline. Add/Edit/Delete actions are disabled.</div>
      )}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-xl">
              <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Billed</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <>
                    <tr key={exp.id} className="border-t text-sm text-center">
                      <td className="px-4 py-2">{exp.clinic_name || exp.clinic_id}</td>
                      <td className="px-4 py-2">{exp.expense_date}</td>
                      <td className="px-4 py-2">{exp.category}</td>
                      <td className="px-4 py-2">₹{exp.billed_amount}</td>
                      <td className="px-4 py-2">₹{exp.received_amount}</td>
                      <td className="px-4 py-2 text-red-600 font-medium">
                        ₹{Number(exp.pending_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-4 py-2">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {/* <button
                            onClick={() => handleEdit(exp.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                          >
                            ✏️ Edit
                          </button> */}
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                            disabled={!isOnline}
                          >
                            ❌ Delete
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/expenses/details/${exp.id}`, {
                                state: { clinicId: exp.clinic_id },
                              })
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                          >
                            📄 View Details
                          </button>
                          <button
                            onClick={() => openPaymentsModal(exp.payments, exp.id)}
                            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded transition"
                          >
                            💳 Payments
                          </button>
                          {Number(exp.pending_amount) > 0 && (
                            <button
                              onClick={() => openCollectForm(exp.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                              disabled={!isOnline}
                            >
                              💵 Collect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
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

      {/* Collect Modal */}
      {showCollectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              Collect Remaining Payment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount Received Now
                </label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="₹"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date Received
                </label>
                <input
                  type="date"
                  className="input w-full"
                  value={collectedDate}
                  onChange={(e) => setCollectedDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setShowCollectForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCollectSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPaymentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg font-bold text-center mb-4">Payment Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-xl">
                <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments && currentPayments.length > 0 ? (
                    currentPayments.map((p) => (
                      <tr key={p.id} className="border-t text-sm text-center">
                        <td className="px-4 py-2">{p.payment_date}</td>
                        <td className="px-4 py-2">₹{p.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-gray-500 py-4 text-center">No payments yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPaymentsModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


