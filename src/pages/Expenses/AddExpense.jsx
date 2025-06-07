import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

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
  const navigate = useNavigate();

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
          },
          { store: 'clinics', method: 'GET' }
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

  // Calculate TDS and totals
  // billedAmount is the amount after TDS deduction (user input)
  const billed = parseFloat(billedAmount) || 0;
  const totalBilled = tdsDeducted === "yes" && billed > 0 ? billed / 0.9 : billed;
  const tds = tdsDeducted === "yes" && billed > 0 ? totalBilled * 0.1 : 0;
  const received = parseFloat(amountReceived) || 0;
  const pendingBalance = billed - received;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("doctor_token");
    try {
      // Find clinic name from clinicList
      const clinicObj = clinicList.find(c => String(c.id) === String(clinicId));
      const clinic_name = clinicObj ? clinicObj.name : clinicId;
      function generateSmallId() {
        return Math.floor(100000 + Math.random() * 900000); // 6-digit
      }
      const ranId = generateSmallId();

      const res = await apiFetch(
        `${BASE_URL}/doctor/expense`,
        {
          method: "POST",
          headers:
        {
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

          }),
        },
        { 
          store: 'expenses', 
          method: 'POST', 
          data: {
            notes,
            expense_date: date,
            category,
            billed_amount: billed,
            tds_deducted: tdsDeducted === "yes",
            tds_amount: tds,
            total_billed: totalBilled,
            payment_status: paymentStatus,
            payment_mode: paymentMode,
            received_amount: received,
            clinic_id: clinicId,
            clinic_name, // added clinic_name
            pending_amount: totalBilled - received, // always present
            payment_local_id: ranId ,// pass to local DB and queue
            id: ranId
          } 
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Get the expense id from the API response
        const responseData = await res.json();
        const expenseId = responseData.id || (responseData.expense && responseData.expense.id);
        // Save the expense in local DB with the backend id for consistency
        if (expenseId) {
          const db = await (await import("../../utils/db")).dbPromise;
          await db.put("expenses", {
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
            received_amount: received,
            pending_amount: totalBilled - received,
            clinic_id: clinicId,
            clinic_name,
            id: expenseId,
          });
        }
        alert("Expense and payment added successfully.");
        navigate("/expenses/list");
      } else if (data.offline) {
        // Offline: update cache and UI immediately
        const db = await (await import("../../utils/db")).dbPromise;
        // Find clinic name from clinicList
        const clinicObj = clinicList.find(c => String(c.id) === String(clinicId));
        const clinic_name = clinicObj ? clinicObj.name : clinicId;
        // Generate a small unique ID for offline record (e.g., random 6-digit number)
        
        const offlineExpense = {
          notes,
          expense_date: date,
          category,
          billed_amount: billed,
          tds_deducted: tdsDeducted === "yes",
          tds_amount: tds,
          total_billed: totalBilled,
          payment_status: paymentStatus,
          payment_mode: paymentMode,
          amount_received: received, // for compatibility
          received_amount: received, // always present
          pending_amount: pendingBalance, // always present
          clinic_id: clinicId,
          clinic_name, // always present
          id: ranId,
          payment_local_id: ranId,
        };
        await db.put("expenses", offlineExpense);
        alert("Expense added offline. Will sync when online.");
        // Instead of navigate+replace, just navigate to trigger ExpenseList fetch
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
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}





