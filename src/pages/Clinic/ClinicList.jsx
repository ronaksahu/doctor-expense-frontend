const clinics = [
    {
      name: "Aaditya Nursing Home",
      branch: "Ambernath",
    },
    {
      name: "Kirti Hospital",
      branch: "Ulhasnagar",
    },
    // Add more clinics here as needed
  ];
  
  export default function ClinicList() {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Clinic List</h2>
  
        <div className="space-y-4 max-w-3xl mx-auto">
          {clinics.map((clinic, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">{clinic.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Branch: {clinic.branch}</p>
  
              <div className="flex flex-wrap gap-3">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                  ✏️ Edit Clinic
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                  ➕ Add Expense
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  📄 View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  