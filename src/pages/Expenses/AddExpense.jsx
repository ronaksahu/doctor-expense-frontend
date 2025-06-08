import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
import { Network } from '@capacitor/network';

export default function AddExpense() {
  const [clinicList, setClinicList] = useState([]);
  const [clinicId, setClinicId] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [billedAmount, setBilledAmount] = useState("");
  const [tdsDeducted, setTdsDeducted] = useState("no");
  const [paymentStatus, setPaymentStatus] = useState("None");
  const [paymentMode, setPaymentMode] = useState("NEFT");
  const [amountReceived, setAmountReceived] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch clinic names on mount
  useEffect(() => {
    async function fetchClinics() {
      try {
        const token = localStorage.getItem("doctor_token");
        const res = await apiFetch(
          `${BASE_URL}/doctor/getAllClinicNames`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.clinics)) {
          setClinicList(data.clinics);
        }
      } catch {
        setClinicList([]);
      }
    }
    fetchClinics();
  }, []);

  // Update online status on navigator.onLine change
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

  // Set clinicId from query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clinicIdParam = params.get("clinic_id");
    if (clinicIdParam) setClinicId(clinicIdParam);
  }, [location.search]);

  // Calculate TDS and totals
  // billedAmount is the amount after TDS deduction (user input)
  const billed = parseFloat(billedAmount) || 0;
  const totalBilled = tdsDeducted === "yes" && billed > 0 ? billed / 0.9 : billed;
  const tds = tdsDeducted === "yes" && billed > 0 ? totalBilled * 0.1 : 0;
  const received = parseFloat(amountReceived) || 0;
  const pendingBalance = billed - received;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) return;
    try {
      const token = localStorage.getItem("doctor_token");
      // Find clinic name from clinicList

      function generateSmallId() {
        return Math.floor(100000 + Math.random() * 900000); // 6-digit
      }
      const ranId = generateSmallId();

      const res = await apiFetch(
        `${BASE_URL}/doctor/expense`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes,
            expense_date: date,
            category,
            billed_amount: billed,
            tds_deducted: tdsDeducted === "yes",
            tds_amount: tds,
            total_billed: totalBilled,
            payment_status: paymentStatus,
            payment_mode: paymentMode,
            amount_received: received,
            clinic_id: clinicId,
            payment_local_id: ranId
          })
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Expense added successfully.");
        navigate("/expenses/list");
      } else {
        alert(data.message || "Failed to add expense");
      }
    } catch {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Add Expense</h2>
        {!isOnline && (
          <div className="text-center text-red-500 mb-4">You are offline. Add actions are disabled.</div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Clinic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
            <select
              className="input"
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              required
            >
              <option value="">Select Clinic Name</option>
              {clinicList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {/* Show selected clinic name as text if clinicId is set and found in clinicList */}
            {clinicId && clinicList.length > 0 && (
              <div className="mt-2 text-green-700 font-semibold">
                Selected Clinic: {clinicList.find(c => String(c.id) === String(clinicId))?.name || ""}
              </div>
            )}
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
              required
            />
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="OPD">OPD</option>
              <option value="Procedure">Procedure</option>
              <option value="Surgery">Surgery</option>
              <option value="IPD">IPD</option>
              <option value="Consultation">Consultation</option>
            </select>
          </div>
          {/* Billed Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Billed Amount</label>
            <input
              type="number"
              className="input"
              value={billedAmount}
              onChange={(e) => setBilledAmount(e.target.value)}
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
                  name="tdsDeducted"
                  value="no"
                  checked={tdsDeducted === "no"}
                  onChange={() => setTdsDeducted("no")}
                />
                No
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tdsDeducted"
                  value="yes"
                  checked={tdsDeducted === "yes"}
                  onChange={() => setTdsDeducted("yes")}
                />
                Yes
              </label>
            </div>
          </div>
          {/* Total Billed Amount (before TDS, auto) */}
          {tdsDeducted === "yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Billed Amount (before TDS)</label>
              <input
                type="number"
                className="input bg-gray-100"
                value={totalBilled.toFixed(2)}
                readOnly
              />
            </div>
          )}
          {/* TDS Amount (auto) */}
          {tdsDeducted === "yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">TDS Amount (10% of Total Billed)</label>
              <input
                type="number"
                className="input bg-gray-100"
                value={tds.toFixed(2)}
                readOnly
              />
            </div>
          )}
          {/* Amount Received */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Received</label>
            <input
              type="number"
              className="input"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
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
              <option>Bank Transfer</option>
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
              <option>Received</option>
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
            disabled={!isOnline}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}





