export default function AddClinic() {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">Add Clinic</h2>
  
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Clinic/Hospital Name</label>
              <input
                type="text"
                placeholder="e.g. Kirti Hospital"
                className="input"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Location / Address</label>
              <input
                type="text"
                placeholder="e.g. Ulhasnagar"
                className="input"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin</label>
              <input
                type="text"
                placeholder="Admin Name"
                className="input"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Details</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                className="input"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows="3"
                placeholder="Additional info..."
                className="input"
              />
            </div>
  
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Add Clinic
            </button>
          </form>
        </div>
      </div>
    );
  }
  