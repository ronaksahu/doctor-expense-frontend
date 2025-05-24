import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Expense Record App</h1>
        <button
          onClick={() => navigate("/profile")}
          className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          👁️ View & Profile Edit
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Hello, Dr. Name 👋</h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/clinic/add")}
            className="bg-green-600 text-white py-3 rounded-md shadow hover:bg-green-700"
          >
            ➕ Add Clinic
          </button>
          <button
            onClick={() => navigate("/clinic/list")}
            className="bg-blue-500 text-white py-3 rounded-md shadow hover:bg-blue-600"
          >
            📋 Clinic List
          </button>
          <button
            onClick={() => navigate("/expenses/add")}
            className="bg-indigo-600 text-white py-3 rounded-md shadow hover:bg-indigo-700"
          >
            ➕ Add Expenses
          </button>
          <button
            onClick={() => navigate("/expenses/list")}
            className="bg-yellow-500 text-white py-3 rounded-md shadow hover:bg-yellow-600"
          >
            🗂️ Expense List
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="bg-purple-600 text-white py-3 rounded-md shadow hover:bg-purple-700"
          >
            📊 Complete Reports
          </button>
          <button
            onClick={() => navigate("/records")}
            className="bg-pink-500 text-white py-3 rounded-md shadow hover:bg-pink-600"
          >
            🏥 Hospital Records
          </button>
        </div>

        {/* Logout */}
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem("doctor_logged_in");
              navigate("/");
            }}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
      </main>

      {/* Bottom Nav (optional for mobile) */}
      <nav className="bg-white border-t text-center text-sm text-gray-700 py-3">
        Home • Clinic List • Expense List • Complete Reports
      </nav>
    </div>
  );
}
