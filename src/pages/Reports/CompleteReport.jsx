// src/pages/Reports/CompleteReport.jsx
import { useState, useMemo } from "react";

export default function CompleteReport() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
    tds: "",
    payment: "",
    clinic: "",
  });

  // Dummy “flat” data for all expenses
  const allData = [
    {
      clinic: "Kirti Hospital",
      date: "2025-04-10",
      category: "OPD",
      billed: 500,
      received: 450,
      pending: 50,
      tds: 50,
      paymentStatus: "Partial",
    },
    {
      clinic: "Kirti Hospital",
      date: "2025-04-12",
      category: "Surgery",
      billed: 1500,
      received: 1500,
      pending: 0,
      tds: 150,
      paymentStatus: "Full",
    },
    {
      clinic: "Aaditya Nursing Home",
      date: "2025-04-08",
      category: "IPD",
      billed: 2000,
      received: 1800,
      pending: 200,
      tds: 200,
      paymentStatus: "Partial",
    },
    {
      clinic: "Aaditya Nursing Home",
      date: "2025-04-15",
      category: "Procedure",
      billed: 800,
      received: 800,
      pending: 0,
      tds: 80,
      paymentStatus: "Full",
    },
  ];

  // Filter logic (simple in-memory filtering)
  const filtered = useMemo(() => {
    return allData.filter((row) => {
      if (filters.clinic && row.clinic !== filters.clinic) return false;
      if (filters.category && row.category !== filters.category) return false;
      if (filters.tds && (filters.tds === "yes") !== (row.tds > 0)) return false;
      if (filters.payment && row.paymentStatus !== filters.payment) return false;
      if (filters.from && row.date < filters.from) return false;
      if (filters.to && row.date > filters.to) return false;
      return true;
    });
  }, [filters]);

  // Summary cards
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.billed   += r.billed;
        acc.received += r.received;
        acc.pending  += r.pending;
        acc.tds      += r.tds;
        return acc;
      },
      { billed: 0, received: 0, pending: 0, tds: 0 }
    );
  }, [filtered]);

  const handleChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Complete Report
      </h2>

      {/* — Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleChange}
          className="input"
        />
        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleChange}
          className="input"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="input"
        >
          <option value="">All Categories</option>
          <option>OPD</option>
          <option>Procedure</option>
          <option>Surgery</option>
          <option>IPD</option>
        </select>
        <select
          name="tds"
          value={filters.tds}
          onChange={handleChange}
          className="input"
        >
          <option value="">TDS</option>
          <option value="yes">Deducted</option>
          <option value="no">None</option>
        </select>
        <select
          name="payment"
          value={filters.payment}
          onChange={handleChange}
          className="input"
        >
          <option value="">Payment Status</option>
          <option>None</option>
          <option>Partial</option>
          <option>Full</option>
        </select>
        <select
          name="clinic"
          value={filters.clinic}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Clinic</option>
          <option>Kirti Hospital</option>
          <option>Aaditya Nursing Home</option>
        </select>
      </div>

      {/* — Earnings Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Billed</div>
          <div className="text-xl font-bold">₹{totals.billed.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Received</div>
          <div className="text-xl font-bold">₹{totals.received.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Pending</div>
          <div className="text-xl font-bold text-red-600">
            ₹{totals.pending.toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total TDS</div>
          <div className="text-xl font-bold text-green-600">
            ₹{totals.tds.toFixed(2)}
          </div>
        </div>
      </div>

      {/* — TDS Verification Panel */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">TDS Verification</h3>
        <p className="text-sm text-gray-700">
          Check these totals against your ITR returns to ensure accuracy.
        </p>
      </div>

      {/* — Summary Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-blue-100 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-4 py-2">Clinic</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Billed</th>
              <th className="px-4 py-2">Received</th>
              <th className="px-4 py-2">Pending</th>
              <th className="px-4 py-2">TDS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t text-sm">
                <td className="px-4 py-2">{r.clinic}</td>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.category}</td>
                <td className="px-4 py-2">₹{r.billed}</td>
                <td className="px-4 py-2">₹{r.received}</td>
                <td className="px-4 py-2 text-red-600">₹{r.pending}</td>
                <td className="px-4 py-2 text-green-600">₹{r.tds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* — Download Button */}
      <div className="text-center">
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
          📥 Download Excel
        </button>
      </div>
    </div>
  );
}
