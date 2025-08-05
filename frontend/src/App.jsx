import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "../firebase.js";
// Updated import path
import AuthComponent from "./Components/AuthCard";
import LandingPage from "./Pages/LandingPage";
import UserDashboard from "./Pages/Dashboard/UserDashboard.jsx";
import NgoDashboard from "./Pages/Dashboard/NgoDashboard.jsx";
import HrDashboard from "./Pages/Dashboard/HrDashboard.jsx";
import POSHExplainer from "./Pages/POSHExplainer.jsx";
import Complaint from './Components/Complaint.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/dashboard/:role" element={<UserDashboard />} />
        <Route path="/NGO" element={<NgoDashboard />} />
        <Route path="/HR" element={<HrDashboard />} />
        <Route path="/posh-explainer" element={<POSHExplainer />} />
        {/* Redirects for convenience */}
        <Route path="/dashboard/NGO" element={<Navigate to="/NGO" />} />
        <Route path="/dashboard/HR" element={<Navigate to="/HR" />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        <Route path="/complain" element={<Complaint/>} />
        {/* Redirect /signin to /auth */}
        <Route path="/signin" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
