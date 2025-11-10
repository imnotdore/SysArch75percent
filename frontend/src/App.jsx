import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { FileProvider } from "./context/Filecontext"; 
import { ScheduleProvider } from "./context/ScheduleContext";
import { ComputerBorrowingProvider } from "./context/ComputerBorrowingContext"; 

// Main Pages
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TermsOfService from "./pages/TermsofService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivateRoute from "./components/PrivateRoute";

// Resident Pages
import ResidentDashboard from "./pages//resident/ResidentDashboard";
import DisclosureBoard from "./pages//resident/DisclosureBoard";
import Request from "./pages//resident/Request";
import Schedule from "./pages/resident/Schedule";
import YourAccount from "./pages/resident/YourAccount";
import ComputerBorrowing from "./pages/resident/ComputerBorrowing";

// Staff Pages - CORRECTED IMPORT PATHS
import StaffDashboard from "./pages/staff/tabs/StaffDashboard"; // ✅ TAMA NA ITO
import InboxTab from "./pages/staff/tabs/InboxTab";
import AcceptedTab from "./pages/staff/tabs/AcceptedTab";
import AccountsTab from "./pages/staff/tabs/AccountsTab";
import PrintedTab from "./pages/staff/tabs/PrintedTab";
import ReleasedTab from "./pages/staff/tabs/ReleasedTab";
import ScheduledTab from "./pages/staff/tabs/ScheduledTab";
import ReturnedTab from "./pages/staff/tabs/ReturnedTab";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import AddStaffModal from "./pages/admin/AddStaffModal";
import DashboardCards from "./pages/admin/DashboardCards";
import ConfirmationModal from "./pages/admin/ConfirmationModal";
import EditUserModal from "./pages/admin/EditUserModal";
import Sidebar from "./pages/admin/Sidebar";
import UsersTable from "./pages/admin/UsersTable";

function App() {
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/auth/admin/check-exists`);
        setAdminExists(res.data.exists);
      } catch (err) {
        console.error("Failed to check admin existence:", err);
        setAdminExists(true); // Default to true to prevent unauthorized access
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [baseUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <FileProvider>
          <ScheduleProvider>
            <ComputerBorrowingProvider>
              <Routes>
                {/* Landing / Role Selection */}
                <Route path="/" element={<RoleSelection />} />

                {/* Login & Register */}
                <Route path="/:role/login" element={<Login />} />
                <Route path="/:role/register" element={<Register />} />

                {/* Admin Registration (hidden route - only accessible when no admin exists) */}
                {!adminExists && (
                  <Route path="/admin/register" element={<AdminRegister />} />
                )}

                {/* Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <PrivateRoute role="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/add-staff" 
                  element={
                    <PrivateRoute role="admin">
                      <AddStaffModal />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/db" 
                  element={
                    <PrivateRoute role="admin">
                      <DashboardCards />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <PrivateRoute role="admin">
                      <UsersTable />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin/edit-user/:id" 
                  element={
                    <PrivateRoute role="admin">
                      <EditUserModal />
                    </PrivateRoute>
                  } 
                />

                {/* Staff Routes */}
                <Route 
                  path="/staff/dashboard" 
                  element={
                    <PrivateRoute role="staff">
                      <StaffDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/inbox" 
                  element={
                    <PrivateRoute role="staff">
                      <InboxTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/accounts" 
                  element={
                    <PrivateRoute role="staff">
                      <AccountsTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/accepted" 
                  element={
                    <PrivateRoute role="staff">
                      <AcceptedTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/released" 
                  element={
                    <PrivateRoute role="staff">
                      <ReleasedTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/returned" 
                  element={
                    <PrivateRoute role="staff">
                      <ReturnedTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/printed" 
                  element={
                    <PrivateRoute role="staff">
                      <PrintedTab />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/staff/schedule" 
                  element={
                    <PrivateRoute role="staff">
                      <ScheduledTab />
                    </PrivateRoute>
                  } 
                />

                {/* Resident Routes */}
                <Route 
                  path="/resident/dashboard" 
                  element={
                    <PrivateRoute role="resident">
                      <ResidentDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/resident/disclosure-board" 
                  element={
                    <PrivateRoute role="resident">
                      <DisclosureBoard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/resident/request" 
                  element={
                    <PrivateRoute role="resident">
                      <Request />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/resident/schedule" 
                  element={
                    <PrivateRoute role="resident">
                      <Schedule />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/resident/youraccount" 
                  element={
                    <PrivateRoute role="resident">
                      <YourAccount />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/resident/computer-borrowing" 
                  element={
                    <PrivateRoute role="resident">
                      <ComputerBorrowing />
                    </PrivateRoute>
                  } 
                />

                {/* Legal Pages (Public) */}
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Fallback Routes */}
                {!adminExists ? (
                  <Route path="*" element={<Navigate to="/admin/register" />} />
                ) : (
                  <Route path="*" element={<Navigate to="/" />} />
                )}
              </Routes>
            </ComputerBorrowingProvider>
          </ScheduleProvider>
        </FileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;