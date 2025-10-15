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
import { ComputerBorrowingProvider } from "./context/ComputerBorrowingContext"; // ✅ import new context

import ComputerBorrowing from "./pages/ComputerBorrowing";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffAnnouncements from "./pages/staff/StaffAnnouncements";
import StaffImages from "./pages/staff/StaffImages";
import AcceptedList from "./pages/staff/AcceptedList";

function App() {
  return (
    <BrowserRouter>
      <FileProvider>
        <ScheduleProvider>
          <ComputerBorrowingProvider> {/* ✅ wrap context here */}
            <Routes>
              {/* Landing / Role Selection */}
              <Route path="/" element={<RoleSelection />} />

              {/* Login & Register */}
              <Route path="/:role/login" element={<Login />} />
              <Route path="/:role/register" element={<Register />} />

              {/* Staff Routes */}
              <Route path="/staff/dashboard" element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />
              <Route path="/staff/requests" element={<PrivateRoute><StaffRequests /></PrivateRoute>} />
              <Route path="/staff/announcements" element={<PrivateRoute><StaffAnnouncements /></PrivateRoute>} />
              <Route path="/staff/images" element={<PrivateRoute><StaffImages /></PrivateRoute>} />
              <Route path="/staff/accepted" element={<PrivateRoute><AcceptedList /></PrivateRoute>} />

              {/* Resident Routes */}
              <Route path="/resident/dashboard" element={<PrivateRoute><ResidentDashboard /></PrivateRoute>} />
              <Route path="/resident/disclosure-board" element={<PrivateRoute><DisclosureBoard /></PrivateRoute>} />
              <Route path="/resident/request" element={<PrivateRoute><Request /></PrivateRoute>} />
              <Route path="/resident/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
              <Route path="/resident/youraccount" element={<PrivateRoute><YourAccount /></PrivateRoute>} />
              <Route path="/resident/computer-borrowing" element={<PrivateRoute><ComputerBorrowing /></PrivateRoute>} />

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
