//✅ src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import AdminLogin from "./pages/Auth/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddClinic from "./pages/Clinic/AddClinic";
import ClinicList from "./pages/Clinic/ClinicList";
import ClinicDetails from "./pages/Clinic/ClinicDetails";
import EditClinic from "./pages/Clinic/EditClinic";
import AddExpense from "./pages/Expenses/AddExpense";
import EditExpense from "./pages/Expenses/EditExpense";
import ExpenseList from "./pages/Expenses/ExpenseList";
import ExpenseDetails from "./pages/Expenses/ExpenseDetails";
import CompleteReport from "./pages/Reports/CompleteReport";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Components
import MobileLayout from "./components/MobileLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/clinic/details/:id" element={<ClinicDetails />} />
        <Route path="/clinic/edit/:id" element={<EditClinic />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MobileLayout><Dashboard /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MobileLayout><Profile /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinic/add"
          element={
            <ProtectedRoute>
              <MobileLayout><AddClinic /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinic/list"
          element={
            <ProtectedRoute>
              <MobileLayout><ClinicList /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/add"
          element={
            <ProtectedRoute>
              <MobileLayout><AddExpense /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/edit/:id"
          element={
            <ProtectedRoute>
              <MobileLayout><EditExpense /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/list"
          element={
            <ProtectedRoute>
              <MobileLayout><ExpenseList /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/details/:id"
          element={
            <ProtectedRoute>
              <MobileLayout><ExpenseDetails /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/complete"
          element={
            <ProtectedRoute>
              <MobileLayout><CompleteReport /></MobileLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const isDoctor = localStorage.getItem("doctor_logged_in") === "true" && localStorage.getItem("doctor_token");
    const isAdmin = localStorage.getItem("admin_token");
    if (isDoctor) {
      navigate("/dashboard", { replace: true });
    } else if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
    // else show login (handled by route)
  }, [navigate]);
  return <Login />;
}

export default App;