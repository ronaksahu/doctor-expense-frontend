// ✅ src/components/MobileLayout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function MobileLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "🏠 Home", path: "/dashboard" },
    { label: "🏥 Clinics", path: "/clinic/list" },
    { label: "💰 Expenses", path: "/expenses/list" },
    { label: "📊 Reports", path: "/reports/complete" },
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("doctor_logged_in");
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow overflow-y-auto">{children}</main>

      <nav className="bg-white border-t px-4 py-2 text-xs flex justify-around fixed bottom-0 w-full shadow-md z-10">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`flex-1 text-center py-2 px-1 ${
              location.pathname === item.path
                ? "text-blue-600 font-bold"
                : "text-gray-600"
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


