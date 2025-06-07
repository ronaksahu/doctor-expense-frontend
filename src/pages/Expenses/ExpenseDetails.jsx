import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function ExpenseDetails() {
  const { id } = useParams(); // expense id
  const location = useLocation();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get clinic_id from query or location state
  const clinicId = location.state?.clinicId;

  useEffect(() => {
    async function fetchExpense() {
      setLoading(true);
      try {
        const token = localStorage.getItem("doctor_token");
        const res = await apiFetch(
          `${BASE_URL}/doctor/expense/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
          { store: 'expenses', method: 'GET' }
        );
        const data = await res.json();
        // Try to find the expense by id in both online and offline mode
        let foundExpense = null;
        if (res.ok && data.expense) {
          foundExpense = data.expense;
        } else if (data.expenses && Array.isArray(data.expenses)) {
          foundExpense = data.expenses.find((e) => String(e.id) === String(id));
        } else if (Array.isArray(data) && data.length) {
          foundExpense = data.find((e) => String(e.id) === String(id));
        }
        if (foundExpense) {
          setExpense(foundExpense);
        } else {
          alert(data.message || "Failed to fetch expense details");
        }
      } catch {
        alert("Network error");
      }
      setLoading(false);
    }
    if (clinicId && id) fetchExpense();
  }, [clinicId, id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!expense) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Expense not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <button
          className="mb-4 text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          ← Back to Expense List
        </button>
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Expense Details</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
            <input type="text" className="input bg-gray-100" value={expense.clinic_name || ""} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input type="text" className="input bg-gray-100" value={expense.notes} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" className="input bg-gray-100" value={expense.expense_date} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" className="input bg-gray-100" value={expense.category} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Billed Amount</label>
            <input type="number" className="input bg-gray-100" value={expense.billed_amount} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">TDS Deducted?</label>
            <input type="text" className="input bg-gray-100" value={expense.tds_deducted ? "Yes" : "No"} readOnly />
          </div>
          {expense.tds_deducted && (
            <div>
              <label className="block text-sm font-medium text-gray-700">TDS Amount</label>
              <input type="number" className="input bg-gray-100" value={expense.tds_amount} readOnly />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount (After TDS)</label>
            <input type="number" className="input bg-gray-100" value={expense.billed_amount - expense.tds_amount} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Received</label>
            <input type="number" className="input bg-gray-100" value={expense.received_amount} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
            <input type="text" className="input bg-gray-100" value={expense.payment_mode} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <input type="text" className="input bg-gray-100" value={expense.payment_status} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pending Balance</label>
            <input type="number" className="input bg-gray-100" value={expense.pending_amount} readOnly />
          </div>
        </form>
      </div>
    </div>
  );
}
