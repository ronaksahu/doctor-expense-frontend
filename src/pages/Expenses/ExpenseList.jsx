import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ExpenseList() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      clinicName: "Kirti Hospital",
      category: "OPD",
      date: "2025-04-25",
      billedReceived: 90,
      paymentHistory: [{ amount: 60, date: "2025-04-25" }],
    },
    {
      id: 2,
      clinicName: "Aaditya Nursing Home",
      category: "Surgery",
      date: "2025-04-24",
      billedReceived: 120,
      paymentHistory: [{ amount: 120, date: "2025-04-24" }],
    },
  ]);

  const [showCollectForm, setShowCollectForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [collectedDate, setCollectedDate] = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");

  const openCollectForm = (id) => {
    setCurrentId(id);
    setShowCollectForm(true);
  };

  const openViewModal = (id) => {
    setCurrentId(id);
    setShowViewModal(true);
  };

  const handleCollectSave = () => {
    if (!collectedDate || !additionalAmount) {
      alert("Please fill both fields");
      return;
    }

    const updatedExpenses = expenses.map((exp) => {
      if (exp.id === currentId) {
        const updatedHistory = [
          ...exp.paymentHistory,
          { amount: parseFloat(additionalAmount), date: collectedDate },
        ];

        const totalReceived = updatedHistory.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...exp,
          paymentHistory: updatedHistory,
          paymentReceived: totalReceived,
          dateOfPendingPayment:
            totalReceived >= exp.billedReceived ? collectedDate : null,
        };
      }
      return exp;
    });

    setExpenses(updatedExpenses);
    setShowCollectForm(false);
    setCurrentId(null);
    setCollectedDate("");
    setAdditionalAmount("");
  };

  const handleEdit = (id) => navigate(`/expenses/edit/${id}`);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const selectedExpense = expenses.find((e) => e.id === currentId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Expense Records</h2>

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
            {expenses.map((exp) => {
              const received = exp.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
              const pending = exp.billedReceived - received;
              return (
                <tr key={exp.id} className="border-t text-sm">
                  <td className="px-4 py-2">{exp.clinicName}</td>
                  <td className="px-4 py-2">{exp.date}</td>
                  <td className="px-4 py-2">{exp.category}</td>
                  <td className="px-4 py-2">₹{exp.billedReceived}</td>
                  <td className="px-4 py-2">₹{received}</td>
                  <td className="px-4 py-2 text-red-600 font-medium">₹{pending.toFixed(2)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(exp.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ❌ Delete
                    </button>
                    <button
                      onClick={() => openViewModal(exp.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      🔍 View
                    </button>
                    {pending > 0 && (
                      <button
                        onClick={() => openCollectForm(exp.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        💵 Collect
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Collect Modal */}
      {showCollectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">Collect Remaining Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Received Now</label>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="₹"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Received</label>
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

      {/* View Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-center mb-2">Payment History</h3>
            <p className="text-sm mb-2">Clinic: {selectedExpense.clinicName}</p>
            <p className="text-sm mb-2">Billed: ₹{selectedExpense.billedReceived}</p>
            <ul className="text-sm list-disc pl-6 space-y-1">
              {selectedExpense.paymentHistory.map((p, i) => (
                <li key={i}>
                  ₹{p.amount} received on {p.date}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowViewModal(false)}
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


