import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function RecordsByHospital() {
  // Dummy data – replace with API fetch later
  const initialData = [
    {
      name: "Kirti Hospital",
      expenses: [
        { id: 1, date: "2025-04-10", category: "OPD", billedReceived: 500, tdsDeducted: true, tdsStatus: "", pendingNote: "" },
        { id: 2, date: "2025-04-12", category: "Surgery", billedReceived: 1500, tdsDeducted: false, tdsStatus: "", pendingNote: "" },
      ],
    },
    {
      name: "Aaditya Nursing Home",
      expenses: [
        { id: 3, date: "2025-04-08", category: "IPD", billedReceived: 2000, tdsDeducted: true, tdsStatus: "", pendingNote: "" },
        { id: 4, date: "2025-04-15", category: "Procedure", billedReceived: 800, tdsDeducted: false, tdsStatus: "", pendingNote: "" },
      ],
    },
  ];

  const [hospitals, setHospitals] = useState(initialData);

  // Compute TDS via reverse calculation: billedReceived * (10/90)
  const computeTds = (billed) => parseFloat((billed * (10 / 90)).toFixed(2));

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
                  pendingNote: status === "paid" ? "" : exp.pendingNote,
                }
          ),
        };
      })
    );
  };

  // Handle pending note change
  const handleNoteChange = (hIdx, expId, note) => {
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
                  pendingNote: note,
                }
          ),
        };
      })
    );
  };

  // Handle Excel download
  const handleDownload = () => {
    const data = [];
    hospitals.forEach((hospital) => {
      hospital.expenses.forEach((exp) => {
        data.push({
          Hospital: hospital.name,
          Date: exp.date,
          Category: exp.category,
          Billed: exp.billedReceived,
          "TDS Deducted": exp.tdsDeducted ? "Yes" : "No",
          "TDS Status": exp.tdsStatus || "-",
          "Pending Note": exp.pendingNote || "-",
          "TDS Amount (calculated)": exp.tdsDeducted ? computeTds(exp.billedReceived) : 0,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TDS Records");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Hospital_TDS_Records.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        Records as per Hospital
      </h2>

      <div className="space-y-6">
        {hospitals.map((h, hIdx) => {
          // Dynamic summary: sum of TDS for 'paid' statuses
          const totalTdsPaid = h.expenses.reduce(
            (sum, exp) =>
              exp.tdsStatus === "paid" && exp.tdsDeducted
                ? sum + computeTds(exp.billedReceived)
                : sum,
            0
          );

          return (
            <div key={h.name} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{h.name}</h3>

              <ul className="space-y-4 mb-4">
                {h.expenses.map((exp) => {
                  const tdsAmount = exp.tdsDeducted ? computeTds(exp.billedReceived) : 0;

                  return (
                    <li key={exp.id} className="border-b pb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {exp.date} • {exp.category} • ₹{exp.billedReceived.toFixed(2)}
                          {exp.tdsDeducted && (
                            <span className="ml-4 text-green-600">
                              TDS: ₹{tdsAmount.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {exp.tdsDeducted && (
                          <div className="flex items-center space-x-4">
                            <label className="text-sm">TDS Status:</label>
                            <select
                              className="input w-auto"
                              value={exp.tdsStatus}
                              onChange={(e) =>
                                handleStatusChange(hIdx, exp.id, e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              <option value="paid">Paid</option>
                              <option value="incomplete">Incomplete</option>
                              <option value="pending">Pending</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {exp.tdsDeducted && (exp.tdsStatus === "incomplete" || exp.tdsStatus === "pending") && (
                        <div className="mt-2">
                          <label className="block text-sm mb-1">Note:</label>
                          <input
                            type="text"
                            className="input w-full"
                            value={exp.pendingNote}
                            onChange={(e) =>
                              handleNoteChange(hIdx, exp.id, e.target.value)
                            }
                            placeholder="Pending details"
                          />
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


