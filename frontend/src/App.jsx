import { Navigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoleSelection from './pages/RoleSelection';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import DisclosureBoard from './pages/DisclosureBoard'; // ✅ import
import Request from './pages/Request';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/:role/login" element={<Login />} />
        <Route path="/:role/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resident/dashboard" element={<ResidentDashboard />} />
        <Route path="/resident/disclosure-board" element={<DisclosureBoard />} /> {/* ✅ route */}
        <Route path="/resident/request" element={<Request />} /> {/* ✅ route */}
         <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
