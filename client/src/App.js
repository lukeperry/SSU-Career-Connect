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
import TalentRegister from "./pages/TalentRegister";
import TalentLogin from "./pages/TalentLogin"; // Import TalentLogin component
import TalentProfile from './pages/TalentProfile'; // Import TalentProfile component
import TalentJobBoard from './pages/TalentJobBoard'; // Import TalentJobBoard component
import TalentMessages from './pages/TalentMessages'; // Import TalentMessages component
import TalentLayout from './components/TalentLayout'; // Import TalentLayout component
import ApplicantsList from './components/ApplicantsList'; // Import ApplicantsList component
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
        <Route path="/hr/talent-profile/:id" element={<ProtectedRoute><HRLayout><TalentProfile /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/applicants/:jobId" element={<ProtectedRoute><HRLayout><ApplicantsList /></HRLayout></ProtectedRoute>} /> {/* New route for viewing applicants */}
        
        <Route path="/talent" element={<TalentPage />} />
        <Route path="/talent/login" element={<TalentLogin />} /> {/* Talent Login */}
        <Route path="/talent/register" element={<TalentRegister />} /> {/* Talent Register */}
        <Route path="/talent/dashboard" element={<ProtectedRoute><TalentLayout><TalentDashboard /></TalentLayout></ProtectedRoute>} />
        <Route path="/talent/profile" element={<ProtectedRoute><TalentLayout><TalentProfile /></TalentLayout></ProtectedRoute>} /> {/* Talent Profile */}
        <Route path="/talent/job-board" element={<ProtectedRoute><TalentLayout><TalentJobBoard /></TalentLayout></ProtectedRoute>} /> {/* Talent Job Board */}
        <Route path="/talent/messages" element={<ProtectedRoute><TalentLayout><TalentMessages /></TalentLayout></ProtectedRoute>} /> {/* Talent Messages */} 
      </Routes>
    </Router>
  );
};

export default App;
