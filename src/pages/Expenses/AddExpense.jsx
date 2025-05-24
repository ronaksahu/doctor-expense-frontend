import { useState, useEffect } from "react";

export default function AddExpense() {
  const [clinicName, setClinicName] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [billedReceived, setBilledReceived] = useState("");
  const [tdsDeducted, setTdsDeducted] = useState("no");
  const [tdsAmount, setTdsAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("None");
  const [paymentMode, setPaymentMode] = useState("NEFT");
  const [paymentReceived, setPaymentReceived] = useState("");

  const billed = parseFloat(billedReceived) || 0;
  const received = parseFloat(paymentReceived) || 0;

  // Reverse calculate TDS and Total Amount
  const calculatedTdsAmount =
    tdsDeducted === "yes" ? parseFloat((billed * (10 / 90)).toFixed(2)) : 0;

  const totalAmount =
    tdsDeducted === "yes" ? billed + calculatedTdsAmount : billed;

  const pendingBalance = billed - received;

  // Update tdsAmount whenever billed changes and tds is yes
  useEffect(() => {
    if (tdsDeducted === "yes") {
      setTdsAmount(calculatedTdsAmount);
    } else {
      setTdsAmount(0);
    }
  }, [billedReceived, tdsDeducted]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      clinicName,
      notes,
      date,
      category,
      billedReceived,
      tdsDeducted,
      tdsAmount,
      totalAmount,
      paymentStatus,
      paymentMode,
      paymentReceived,
      pendingBalance,
    };

    console.log("Submitting Expense:", formData);
    alert("Expense Saved ✅");
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
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            >
              <option value="">Select Clinic Name</option>
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

          {/* TDS Amount (Auto Calculated) */}
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
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}



  

  