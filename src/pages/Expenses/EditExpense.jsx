import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
import { Network } from '@capacitor/network';

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  // STATE
  const [clinicName, setClinicName] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [billedReceived, setBilledReceived] = useState("");
  const [tdsDeducted, setTdsDeducted] = useState("no");
  const [tdsAmount, setTdsAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentReceived, setPaymentReceived] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  const billed = parseFloat(billedReceived) || 0;
  const received = parseFloat(paymentReceived) || 0;

  // Reverse TDS Calculation
  const calculatedTdsAmount =
    tdsDeducted === "yes" ? parseFloat((billed * (10 / 90)).toFixed(2)) : 0;

  const totalAmount =
    tdsDeducted === "yes" ? billed + calculatedTdsAmount : billed;

  const pendingBalance = billed - received;

  useEffect(() => {
    if (tdsDeducted === "yes") {
      setTdsAmount(calculatedTdsAmount);
    } else {
      setTdsAmount(0);
    }
  }, [billedReceived, tdsDeducted, calculatedTdsAmount]);

  useEffect(() => {
    let listener;
    Network.getStatus().then(status => setIsOnline(status.connected));
    Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    }).then(l => { listener = l; });
    return () => {
      if (listener && listener.remove) listener.remove();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) return;
    setLoading(true);
    const form = {
      clinicName,
      notes,
      date,
      category,
      billedReceived,
      tdsDeducted,
      tdsAmount,
      paymentStatus,
      paymentMode,
      paymentReceived
    };
    try {
      const token = localStorage.getItem("doctor_token");
      const res = await apiFetch(
        `${BASE_URL}/doctor/expense/${id}`,
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
        alert("Expense updated successfully.");
        navigate("/expenses/list");
      } else {
        alert(data.message || "Failed to update expense");
      }
    } catch {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-yellow-600 text-center mb-6">Edit Expense</h2>

        {!isOnline && (
          <div className="text-center text-red-500 mb-4">You are offline. Update actions are disabled.</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Clinic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
            <select
              className="input"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            >
              <option>Aaditya Nursing Home</option>
              <option>Kirti Hospital</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input
              type="text"
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>OPD</option>
              <option>Procedure</option>
              <option>Surgery</option>
              <option>IPD</option>
            </select>
          </div>

          {/* Billed/Received Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Billed/Received Amount</label>
            <input
              type="number"
              className="input"
              value={billedReceived}
              onChange={(e) => setBilledReceived(e.target.value)}
              required
            />
          </div>

          {/* TDS Deducted */}
          <div>
            <label className="block text-sm font-medium text-gray-700">TDS Deducted?</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tds"
                  value="no"
                  checked={tdsDeducted === "no"}
                  onChange={() => setTdsDeducted("no")}
                />
                No
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tds"
                  value="yes"
                  checked={tdsDeducted === "yes"}
                  onChange={() => setTdsDeducted("yes")}
                />
                Yes
              </label>
            </div>
          </div>

          {/* TDS Amount (auto-calculated) */}
          {tdsDeducted === "yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">TDS Amount</label>
              <input
                type="number"
                className="input bg-gray-100"
                value={tdsAmount}
                readOnly
              />
            </div>
          )}

          {/* Total Amount (Before TDS) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount (Before TDS)</label>
            <input
              type="number"
              className="input bg-gray-100"
              value={totalAmount.toFixed(2)}
              readOnly
            />
          </div>

          {/* Amount Received */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Received</label>
            <input
              type="number"
              className="input"
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.value)}
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
            <select
              className="input"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option>NEFT</option>
              <option>UPI</option>
              <option>Cash</option>
              <option>Cheque</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              className="input"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option>None</option>
              <option>Partial</option>
              <option>Full</option>
            </select>
          </div>

          {/* Pending Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pending Balance</label>
            <input
              type="number"
              className="input bg-gray-100"
              value={pendingBalance.toFixed(2)}
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={!isOnline || loading}
            className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition"
          >
            {loading ? "Updating..." : "Update Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

