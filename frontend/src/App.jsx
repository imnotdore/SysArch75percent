import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

// 🆕 Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffAnnouncements from "./pages/staff/StaffAnnouncements";
import StaffImages from "./pages/staff/StaffImages";

function App() {
  return (
    <BrowserRouter>
      {/* Wrap everything with your providers */}
      <FileProvider>
        <ScheduleProvider>
          <Routes>
            {/* Landing / Role Selection */}
            <Route path="/" element={<RoleSelection />} />

            {/* Login & Register */}
            <Route path="/:role/login" element={<Login />} />
            <Route path="/:role/register" element={<Register />} />

            {/* Admin / Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <PrivateRoute>
                  <StaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/requests"
              element={
                <PrivateRoute>
                  <StaffRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/announcements"
              element={
                <PrivateRoute>
                  <StaffAnnouncements />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/images"
              element={
                <PrivateRoute>
                  <StaffImages />
                </PrivateRoute>
              }
            />

            {/* Resident routes */}
            <Route
              path="/resident/dashboard"
              element={
                <PrivateRoute>
                  <ResidentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/resident/disclosure-board"
              element={
                <PrivateRoute>
                  <DisclosureBoard />
                </PrivateRoute>
              }
            />
            <Route
              path="/resident/request"
              element={
                <PrivateRoute>
                  <Request />
                </PrivateRoute>
              }
            />
            <Route
              path="/resident/schedule"
              element={
                <PrivateRoute>
                  <Schedule />
                </PrivateRoute>
              }
            />
            <Route
              path="/resident/youraccount"
              element={
                <PrivateRoute>
                  <YourAccount />
                </PrivateRoute>
              }
            />

            {/* Legal / Info pages */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ScheduleProvider>
      </FileProvider>
    </BrowserRouter>
  );
}

export default App;
