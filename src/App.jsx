//✅ src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import AdminLogin from "./pages/Auth/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddClinic from "./pages/Clinic/AddClinic";
import ClinicList from "./pages/Clinic/ClinicList";
import AddExpense from "./pages/Expenses/AddExpense";
import EditExpense from "./pages/Expenses/EditExpense";
import ExpenseList from "./pages/Expenses/ExpenseList";
import CompleteReport from "./pages/Reports/CompleteReport";
import RecordsByHospital from "./pages/Reports/RecordsByHospital";

// Components
import MobileLayout from "./components/MobileLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLogin />} />

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
          path="/reports/complete"
          element={
            <ProtectedRoute>
              <MobileLayout><CompleteReport /></MobileLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/hospitals"
          element={
            <ProtectedRoute>
              <MobileLayout><RecordsByHospital /></MobileLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;