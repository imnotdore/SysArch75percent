import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import DisclosureBoard from './pages/DisclosureBoard';
import Request from './pages/Request';
import Schedule from './pages/Schedule';
import YourAccount from './pages/YourAccount';
import TermsOfService from './pages/TermsofService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivateRoute from './components/PrivateRoute';
import { FileProvider } from './context/Filecontext'; // ✅ updated import
import { ScheduleProvider } from "./context/ScheduleContext.jsx";


function App() {
  return (
    <BrowserRouter>
    
      <FileProvider>
        <ScheduleProvider>
        <Routes>
          {/* Landing / Role Selection */}
          <Route path="/" element={<RoleSelection />} />

          {/* Login & Register */}
          <Route path="/:role/login" element={<Login />} />
          <Route path="/:role/register" element={<Register />} />

          {/* Admin / Staff dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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

          {/* Legal / info pages */}
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
