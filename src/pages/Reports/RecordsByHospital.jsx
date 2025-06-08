import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { apiFetch } from "../../utils/apiFetch";
import { BASE_URL } from "../../utils/constants";
import { getAllFromStore } from "../../utils/db";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function RecordsByHospital() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingNotesInput, setPendingNotesInput] = useState({}); // { [expenseId]: value }
  const [pendingNoteLoading, setPendingNoteLoading] = useState({}); // { [expenseId]: boolean }

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (isOnline) {
        try {
          const token = localStorage.getItem("doctor_token");
          const res = await apiFetch(
            `${BASE_URL}/doctor/hospitalWiseReport`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          setHospitals(Array.isArray(data) ? data : []);
        } catch {
          setHospitals([]);
        }
      } else {
        // Offline: group expenses by clinic from local DB
        try {
          const expenses = await getAllFromStore('expenses');
          const clinics = await getAllFromStore('clinics');
          const clinicsMap = (clinics || []).reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
          // Group expenses by clinic_id
          const grouped = {};
          (expenses || []).forEach(exp => {
            if (!grouped[exp.clinic_id]) grouped[exp.clinic_id] = { clinic_id: exp.clinic_id, clinic_name: clinicsMap[exp.clinic_id] || exp.clinic_id, expenses: [] };
            grouped[exp.clinic_id].expenses.push(exp);
          });
          setHospitals(Object.values(grouped));
        } catch {
          setHospitals([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [isOnline]);

  // Compute TDS via reverse calculation: billed_amount * (10/90)
  const computeTds = (billed) => parseFloat((Number(billed) * (10 / 90)).toFixed(2));

  // Handle status change: paid, incomplete, pending
  const handleStatusChange = (hIdx, expId, status) => {
    setHospitals((prev) =>
      prev.map((h, i) => {
        if (i !== hIdx) return h;
        return {
          ...h,
          expenses: h.expenses.map((exp) =>
            exp.id !== expId
              ? exp
              : {
                  ...exp,
                  tdsStatus: status,
                  tds_status: status, // ensure dropdown reflects selected value
                  pendingNote: status === "paid" ? "" : exp.pendingNote,
                }
          ),
        };
      })
    );
  };

  // Handle Excel download
  const handleDownload = async () => {
    const data = [];
    hospitals.forEach((hospital) => {
      hospital.expenses.forEach((exp) => {
        data.push({
          Hospital: hospital.clinic_name,
          Date: exp.expense_date || exp.date,
          Category: exp.category,
          Billed: exp.billed_amount || exp.billedReceived,
          "TDS Deducted": exp.tds_deducted || exp.tdsDeducted ? "Yes" : "No",
          "TDS Status": exp.tds_status || exp.tdsStatus || "",
          "Pending Note": exp.pendingNote || exp.pending_notes || "-",
          "TDS Amount (calculated)": (exp.tds_deducted || exp.tdsDeducted) ? computeTds(exp.billed_amount || exp.billedReceived) : 0,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TDS Records");
    const fileName = `Hospital_TDS_Records_${new Date().toISOString().slice(0,10)}.xlsx`;

    if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      // Android/iOS: use Filesystem and Share
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
      try {
        // Try to save in Downloads/doctor-expense
        const dir = Directory.Documents; // fallback if Downloads not available
        let downloadsDir = Directory.Documents;
        if (Filesystem.Directory.Downloads) downloadsDir = Filesystem.Directory.Downloads;
        // Try to create folder (will not error if exists)
        try {
          await Filesystem.mkdir({
            path: 'doctor-expense',
            directory: downloadsDir,
            recursive: true,
          });
        } catch {/* ignore */}
        // Save file in doctor-expense folder
        const filePath = `doctor-expense/${fileName}`;
        const result = await Filesystem.writeFile({
          path: filePath,
          data: excelBuffer,
          directory: downloadsDir,
          encoding: Filesystem.Encoding.UTF8,
          recursive: true,
        });
        // Ask user to share or open
        await Share.share({
          title: fileName,
          text: 'Hospital TDS Records',
          url: result.uri,
          dialogTitle: 'Share or open your Excel file',
        });
      } catch (err) {
        alert('Failed to save or share file: ' + (err.message || err));
      }
    } else {
      // Web: use Blob and file-saver
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, fileName);
    }
  };

  // Update input value for a specific expense
  const handlePendingNoteInputChange = (expenseId, value) => {
    setPendingNotesInput((prev) => ({ ...prev, [expenseId]: value }));
  };

  // Handler for dropdown change
  const handleTdsStatusChange = async (hIdx, expId, newStatus, pendingNotes) => {
    handleStatusChange(hIdx, expId, newStatus); // local update
    if (!isOnline) return;
    setPendingNoteLoading((prev) => ({ ...prev, [expId]: true }));
    try {
      const token = localStorage.getItem("doctor_token");
      await apiFetch(
        `${BASE_URL}/doctor/expense/update-tds`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            expense_id: expId,
            tds_status: newStatus,
            pending_notes: pendingNotes,
          }),
        }
      );
      // Optionally show success
    } catch {
      // Optionally show error
    }
    setPendingNoteLoading((prev) => ({ ...prev, [expId]: false }));
  };

  // Handler for pending notes submit
  const handlePendingNoteSubmit = async (exp, tdsStatus, pendingNoteInput) => {
    if (!isOnline) return;
    setPendingNoteLoading((prev) => ({ ...prev, [exp.id]: true }));
    try {
      const token = localStorage.getItem("doctor_token");
      await apiFetch(
        `${BASE_URL}/doctor/expense/update-tds`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            expense_id: exp.id,
            tds_status: tdsStatus,
            pending_notes: pendingNoteInput,
          }),
        }
      );
      // Optionally show success
    } catch {
      // Optionally show error
    }
    setPendingNoteLoading((prev) => ({ ...prev, [exp.id]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Records as per Hospital
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {hospitals.map((h, hIdx) => {
            // Dynamic summary: sum of TDS for 'paid' statuses
            const totalTdsPaid = (h.expenses || []).reduce(
              (sum, exp) =>
                (exp.tds_status === "paid" || exp.tdsStatus === "paid") && (exp.tds_deducted || exp.tdsDeducted)
                  ? sum + computeTds(exp.billed_amount || exp.billedReceived)
                  : sum,
              0
            );

            return (
              <div key={h.clinic_id || h.name} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">{h.clinic_name || h.name}</h3>

                <ul className="space-y-4 mb-4">
                  {(h.expenses || []).map((exp) => {
                    const tdsAmount = (exp.tds_deducted || exp.tdsDeducted) ? computeTds(exp.billed_amount || exp.billedReceived) : 0;
                    const tdsStatus = exp.tds_status || exp.tdsStatus || "";
                    const pendingNotes = exp.pending_notes || exp.pendingNote || "";
                    const isOffline = !isOnline;
                    const canEdit = !isOffline && (exp.tds_deducted || exp.tdsDeducted);
                    const canSubmit = canEdit && (tdsStatus === "incomplete" || tdsStatus === "pending");
                    // Use local state for input if available, else fallback to db/API value
                    const pendingNoteInput = pendingNotesInput[exp.id] !== undefined ? pendingNotesInput[exp.id] : pendingNotes;
                    const isLoading = !!pendingNoteLoading[exp.id];
                    return (
                      <li key={exp.id} className="border-b pb-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            {(exp.expense_date || exp.date)} • {exp.category} • ₹{Number(exp.billed_amount || exp.billedReceived).toFixed(2)}
                            {(exp.tds_deducted || exp.tdsDeducted) && (
                              <span className="ml-4 text-green-600">
                                TDS: ₹{tdsAmount.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {(exp.tds_deducted || exp.tdsDeducted) && (
                            <div className="flex items-center space-x-4">
                              <label className="text-sm">TDS Status:</label>
                              <select
                                className="input w-auto"
                                value={tdsStatus}
                                onChange={e => handleTdsStatusChange(hIdx, exp.id, e.target.value, pendingNoteInput)}
                                disabled={isOffline || isLoading}
                              >
                                <option value="">Select</option>
                                <option value="paid">Paid</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="pending">Pending</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {(exp.tds_deducted || exp.tdsDeducted) && (tdsStatus === "incomplete" || tdsStatus === "pending") && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="block text-sm mb-1">Note:</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={pendingNoteInput}
                              onChange={e => handlePendingNoteInputChange(exp.id, e.target.value)}
                              placeholder="Pending details"
                              disabled={isOffline || isLoading}
                              readOnly={isOffline}
                            />
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
                              onClick={() => handlePendingNoteSubmit(exp, tdsStatus, pendingNoteInput)}
                              disabled={!canSubmit || isOffline || isLoading}
                            >
                              {isLoading ? "Saving..." : "Submit"}
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <p className="text-sm font-medium">
                  Total TDS Paid: <span className="text-green-600">₹{totalTdsPaid.toFixed(2)}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Download Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          📥 Download Excel
        </button>
      </div>
    </div>
  );
}


