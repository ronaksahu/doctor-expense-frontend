// src/pages/Reports/CompleteReport.jsx
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";

export default function CompleteReport() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    category: "",
    tds: "",
    payment: "",
    clinic: "",
  });
  const [clinics, setClinics] = useState([]);
  const [report, setReport] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    total_billed: 0,
    total_received: 0,
    total_pending: 0,
    total_tds: 0,
    expenses: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dynamically populate categories from expenses (online/offline)
  const [allCategories, setAllCategories] = useState([
    "OPD", "Procedure", "Surgery", "IPD", "Consultation"
  ]);
  useEffect(() => {
    async function fetchCategories() {
      let categoriesSet = new Set();
      if (navigator.onLine) {
        // Try to get from report.expenses if available
        if (report.expenses && report.expenses.length > 0) {
          report.expenses.forEach(exp => {
            if (exp.category) categoriesSet.add(exp.category);
          });
        }
      } else {
        // Offline: get all categories from local DB
        const db = await (await import("../../utils/db")).dbPromise;
        const allExpenses = await db.getAll("expenses");
        allExpenses.forEach(exp => {
          if (exp.category) categoriesSet.add(exp.category);
        });
      }
      // Always include default categories
      ["OPD", "Procedure", "Surgery", "IPD", "Consultation"].forEach(c => categoriesSet.add(c));
      setAllCategories(Array.from(categoriesSet));
    }
    fetchCategories();
  }, [report.expenses, loading]);

  // Fetch clinic names on mount (only once, even in StrictMode)
  useEffect(() => {
    const token = localStorage.getItem("doctor_token");
    const fetchClinics = async () => {
      try {
        const res = await apiFetch(
          `${BASE_URL}/doctor/getAllClinicNames`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          { store: 'clinics', method: 'GET' }
        );
        const data = await res.json();
        setClinics(data.clinics || []);
      } catch {
        setClinics([]);
      }
    };
    fetchClinics();
  }, []);

  // Fetch report data whenever filters or page change
  useEffect(() => {
    const token = localStorage.getItem("doctor_token");
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (filters.from) params.append("startDate", filters.from);
    if (filters.to) params.append("endDate", filters.to);
    if (filters.clinic) params.append("clinic_id", filters.clinic);
    if (filters.category) params.append("expenseCategory", filters.category);
    if (filters.tds)
      params.append("tdsDeducted", filters.tds === "yes" ? "true" : "false");
    if (filters.payment) params.append("payment_status", filters.payment);
    params.append("page", report.page);
    params.append("limit", report.pageSize);
    const fetchReport = async () => {
      try {
        const res = await apiFetch(
          `${BASE_URL}/doctor/getReport?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          { store: 'expenses', method: 'GET' }
        );
        const data = await res.json();
        if (res.ok) {
          setReport((prev) => ({ ...prev, ...data }));
        } else {
          setError(data.message || "Failed to fetch report");
        }
      } catch {
        setError("Failed to fetch report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line
  }, [filters, report.page]);

  // Calculate totals and filter from local data if offline
  useEffect(() => {
    async function calculateOfflineTotalsAndFilter() {
      if (!navigator.onLine) {
        const db = await (await import("../../utils/db")).dbPromise;
        let allExpenses = await db.getAll("expenses");
        // Apply filters
        allExpenses = allExpenses.filter(exp => {
          if (filters.from && exp.expense_date < filters.from) return false;
          if (filters.to && exp.expense_date > filters.to) return false;
          if (filters.clinic && String(exp.clinic_id) !== String(filters.clinic)) return false;
          if (filters.category && exp.category !== filters.category) return false;
          if (filters.tds) {
            if (filters.tds === "yes" && !exp.tds_deducted) return false;
            if (filters.tds === "no" && exp.tds_deducted) return false;
          }
          if (filters.payment && exp.payment_status !== filters.payment) return false;
          return true;
        });
        let total_billed = 0, total_received = 0, total_pending = 0, total_tds = 0;
        for (const exp of allExpenses) {
          total_billed += Number(exp.billed_amount) || 0;
          total_received += Number(exp.received_amount) || 0;
          total_pending += Number(exp.pending_amount) || 0;
          total_tds += Number(exp.tds_amount) || 0;
        }
        setReport((prev) => ({
          ...prev,
          total_billed,
          total_received,
          total_pending,
          total_tds,
          expenses: allExpenses,
        }));
      }
    }
    calculateOfflineTotalsAndFilter();
  }, [loading, filters]);

  const handleChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name !== "page") setReport((r) => ({ ...r, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setReport((r) => ({ ...r, page: newPage }));
  };

  // Download Excel handler
  const handleDownloadExcel = () => {
    if (!report.expenses || report.expenses.length === 0) return;
    // Prepare data for Excel
    const data = report.expenses.map((r) => ({
      "Clinic": r.clinic_name,
      "Date": r.expense_date,
      "Category": r.category,
      "Billed": r.billed_amount,
      "Received": r.received_amount,
      "Pending": r.pending_amount,
      "TDS": r.tds_amount,
    }));
    // Add summary row at the top
    data.unshift({
      "Clinic": "TOTALS",
      "Date": "",
      "Category": "",
      "Billed": report.total_billed,
      "Received": report.total_received,
      "Pending": report.total_pending,
      "TDS": report.total_tds,
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `doctor-report-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

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
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
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
          {clinics.map((c) => (
            <option key={c.id || c} value={c.id || c}>{c.name || c}</option>
          ))}
        </select>
      </div>

      {/* — Earnings Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Billed</div>
          <div className="text-xl font-bold">₹{Number(report.total_billed).toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Received</div>
          <div className="text-xl font-bold">₹{Number(report.total_received).toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total Pending</div>
          <div className="text-xl font-bold text-red-600">
            ₹{Number(report.total_pending).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-sm">Total TDS</div>
          <div className="text-xl font-bold text-green-600">
            ₹{Number(report.total_tds).toFixed(2)}
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
              <th className="px-4 py-2 text-center">Clinic</th>
              <th className="px-4 py-2 text-center">Date</th>
              <th className="px-4 py-2 text-center">Category</th>
              <th className="px-4 py-2 text-center">Billed</th>
              <th className="px-4 py-2 text-center">Received</th>
              <th className="px-4 py-2 text-center">Pending</th>
              <th className="px-4 py-2 text-center">TDS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center text-red-600 py-4">{error}</td></tr>
            ) : report.expenses.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-4">No data found</td></tr>
            ) : (
              report.expenses.map((r, i) => (
                <tr key={r.id || i} className="border-t text-sm text-center">
                  <td className="px-4 py-2 text-center">{r.clinic_name}</td>
                  <td className="px-4 py-2 text-center">{r.expense_date}</td>
                  <td className="px-4 py-2 text-center">{r.category}</td>
                  <td className="px-4 py-2 text-center">₹{Number(r.billed_amount).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">₹{Number(r.received_amount).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center text-red-600">₹{Number(r.pending_amount).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center text-green-600">₹{Number(r.tds_amount).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mb-6">
        <button
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => handlePageChange(report.page - 1)}
          disabled={report.page <= 1}
        >
          Prev
        </button>
        <span className="px-3 py-1 mx-1">Page {report.page} of {report.totalPages}</span>
        <button
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => handlePageChange(report.page + 1)}
          disabled={report.page >= report.totalPages}
        >
          Next
        </button>
      </div>

      {/* — Download Button */}
      <div className="text-center w-full flex flex-col items-center pb-8 md:pb-0">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition w-full max-w-xs mt-2 z-20 relative"
          style={{ position: 'relative' }}
          onClick={handleDownloadExcel}
          disabled={!report.expenses || report.expenses.length === 0}
        >
          📥 Download Excel
        </button>
      </div>
    </div>
  );
}
