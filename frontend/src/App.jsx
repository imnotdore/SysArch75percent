import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/admin/AdminRegister";
import Dashboard from "./pages/Dashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import DisclosureBoard from "./pages/DisclosureBoard";
import Request from "./pages/Request";
import Schedule from "./pages/Schedule";
import YourAccount from "./pages/YourAccount";
import TermsOfService from "./pages/TermsofService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivateRoute from "./components/PrivateRoute";

import { FileProvider } from "./context/Filecontext"; 
import { ScheduleProvider } from "./context/ScheduleContext";
import { ComputerBorrowingProvider } from "./context/ComputerBorrowingContext"; 

import ComputerBorrowing from "./pages/ComputerBorrowing";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffAnnouncements from "./pages/staff/StaffAnnouncements";
import StaffImages from "./pages/staff/StaffImages";
import AcceptedList from "./pages/staff/AcceptedList";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";


function App() {
  const [adminExists, setAdminExists] = useState(true);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/auth/admin/check-exists`);
        setAdminExists(res.data.exists);
      } catch (err) {
        console.error("Failed to check admin existence:", err);
      }
    };
    checkAdmin();
  }, []);

  return (
    <BrowserRouter>
      <FileProvider>
        <ScheduleProvider>
          <ComputerBorrowingProvider>
            <Routes>
              {/* Landing / Role Selection */}
              <Route path="/" element={<RoleSelection />} />

              {/* Login & Register */}
              <Route path="/:role/login" element={<Login />} />
              <Route path="/:role/register" element={<Register />} />

              {/* Admin Registration (hidden) */}
              {!adminExists && <Route path="/admin/register" element={<AdminRegister />} />}

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
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
                path="/staff/requests" 
                element={
                  <PrivateRoute role="staff">
                    <StaffRequests />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/staff/announcements" 
                element={
                  <PrivateRoute role="staff">
                    <StaffAnnouncements />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/staff/images" 
                element={
                  <PrivateRoute role="staff">
                    <StaffImages />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/staff/accepted" 
                element={
                  <PrivateRoute role="staff">
                    <AcceptedList />
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

              {/* Legal Pages */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ComputerBorrowingProvider>
        </ScheduleProvider>
      </FileProvider>
    </BrowserRouter>
  );
}

export default App;
