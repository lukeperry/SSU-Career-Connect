import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import HRPage from "./pages/HRPage";
import HRRegister from "./pages/HRRegister";
import HRLogin from "./pages/HRLogin";
import HRLayout from './components/HRLayout';
import HRPostedJobs from './pages/HRPostedJobs';
import HRPostJob from './pages/HRPostJob';
import HREditJob from './pages/HREditJob'
import HRProfile from './pages/HRProfile';
import TalentPage from "./pages/TalentPage";
import TalentDashboard from './pages/TalentDashboard';
import HRDashboard from './pages/HRDashboard';
import '@fortawesome/fontawesome-free/css/all.min.css';
//
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/register" element={<HRRegister />} />

        <Route path="/hr/dashboard" element={<ProtectedRoute><HRLayout><HRDashboard /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/profile" element={<ProtectedRoute><HRLayout><HRProfile /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/posted-jobs" element={<ProtectedRoute><HRLayout><HRPostedJobs /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/post-job" element={<ProtectedRoute><HRLayout><HRPostJob /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/edit-job/:id" element={<ProtectedRoute><HRLayout><HREditJob /></HRLayout></ProtectedRoute>} />

        <Route path="/talent" element={<TalentPage />} />
        <Route path="/talent/login" element={<div>Talent Login Page</div>} />
        <Route path="/talent/register" element={<div>Talent Register Page</div>} />
        <Route path="/talent/dashboard" element={<TalentDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
