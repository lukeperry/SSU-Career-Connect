import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LandingPage from './components/LandingPage';
import HRPage from "./pages/HRPage";
import HRRegister from "./pages/HRRegister";
import HRLogin from "./pages/HRLogin";
import HRLayout from './components/HRLayout';
import HRPostedJobs from './pages/HRPostedJobs';
import HRPostJob from './pages/HRPostJob';
import HREditJob from './pages/HREditJob'
import HRProfile from './pages/HRProfile';
import HRMessages from './pages/Messages';
import TalentPage from "./pages/TalentPage";
import TalentDashboard from './pages/TalentDashboard';
import TalentRegister from "./pages/TalentRegister";
import TalentLogin from "./pages/TalentLogin"; // Import TalentLogin component
import TalentProfile from './pages/TalentProfile'; // Import TalentProfile component
import TalentJobBoard from './pages/TalentJobBoard'; // Import TalentJobBoard component
import TalentMessages from './pages/Messages'; // Import TalentMessages component
import TalentLayout from './components/TalentLayout'; // Import TalentLayout component
import ApplicantsList from './components/ApplicantsList'; // Import ApplicantsList component
import SubmittedJobs from './pages/SubmittedJobs'; // Import SubmittedJobs components
import HRDashboard from './pages/HRDashboard';
import AdminLogin from './pages/AdminLogin'; // Import AdminLogin component
import AdminRegister from './pages/AdminRegister'; // Import AdminRegister component
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard component
import AdminFeedbackPage from './pages/AdminFeedbackPage';
import AdminAnalytics from './pages/AdminAnalytics'; // Import AdminAnalytics component
import AdminReports from './pages/AdminReports'; // Import AdminReports component
import AdminUserManagement from './pages/AdminUserManagement'; // Import AdminUserManagement component
import AdminUserView from './pages/AdminUserView'; // Import AdminUserView component (read-only for GOVT_ADMIN)
import AdminProfile from './pages/AdminProfile'; // Import AdminProfile component
import AdminLayout from './components/AdminLayout'; // Import AdminLayout component
import '@fortawesome/fontawesome-free/css/all.min.css';

import TalentFeedbackPage from './pages/TalentFeedbackPage';
import HRFeedbackPage from './pages/HRFeedbackPage';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster 
          position="top-center"
          toastOptions={{
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
            loading: {
              duration: Infinity,
            },
          }}
        />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/register" element={<HRRegister />} />

        <Route path="/hr/dashboard" element={<ProtectedRoute><HRLayout><HRDashboard /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/profile" element={<ProtectedRoute><HRLayout><HRProfile /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/profile/:id" element={<ProtectedRoute><HRLayout><HRProfile /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/posted-jobs" element={<ProtectedRoute><HRLayout><HRPostedJobs /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/post-job" element={<ProtectedRoute><HRLayout><HRPostJob /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/edit-job/:id" element={<ProtectedRoute><HRLayout><HREditJob /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/talent-profile/:id" element={<ProtectedRoute><HRLayout><TalentProfile /></HRLayout></ProtectedRoute>} />
        <Route path="/hr/applicants/:jobId" element={<ProtectedRoute><HRLayout><ApplicantsList /></HRLayout></ProtectedRoute>} /> {/* New route for viewing applicants */}
        <Route path="/hr/messages" element={<ProtectedRoute><HRLayout><HRMessages /></HRLayout></ProtectedRoute>} />

        <Route path="/talent" element={<TalentPage />} />
        <Route path="/talent/login" element={<TalentLogin />} /> {/* Talent Login */}
        <Route path="/talent/register" element={<TalentRegister />} /> {/* Talent Register */}
        <Route path="/talent/dashboard" element={<ProtectedRoute><TalentLayout><TalentDashboard /></TalentLayout></ProtectedRoute>} />
        <Route path="/talent/profile" element={<ProtectedRoute><TalentLayout><TalentProfile /></TalentLayout></ProtectedRoute>} /> {/* Talent Profile */}
        <Route path="/talent/profile/:id" element={<ProtectedRoute><TalentLayout><TalentProfile /></TalentLayout></ProtectedRoute>} /> {/* View another talent's profile */}
        <Route path="/talent/hr-profile/:id" element={<ProtectedRoute><TalentLayout><HRProfile /></TalentLayout></ProtectedRoute>} /> {/* View HR profile */}
        <Route path="/talent/job-board" element={<ProtectedRoute><TalentLayout><TalentJobBoard /></TalentLayout></ProtectedRoute>} /> {/* Talent Job Board */}
        <Route path="/talent/submitted-jobs" element={<ProtectedRoute><TalentLayout><SubmittedJobs /></TalentLayout></ProtectedRoute>} /> {/* New route */}
        <Route path="/talent/messages" element={<ProtectedRoute><TalentLayout><TalentMessages /></TalentLayout></ProtectedRoute>} /> {/* Talent Messages */}
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} /> {/* Admin Login */}
        <Route path="/admin/register" element={<AdminRegister />} /> {/* Admin Register */}
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} /> {/* Admin Dashboard */}
        <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminProtectedRoute>} /> {/* Admin Analytics */}
        <Route path="/admin/reports" element={<AdminProtectedRoute><AdminLayout><AdminReports /></AdminLayout></AdminProtectedRoute>} /> {/* Admin Reports */}
    <Route path="/admin/user-management" element={<AdminProtectedRoute><AdminUserManagement /></AdminProtectedRoute>} /> {/* Admin User Management (Platform Admin only) - Already has AdminLayout inside */}
    <Route path="/admin/user-view" element={<AdminProtectedRoute><AdminUserView /></AdminProtectedRoute>} /> {/* Admin User View (GOVT_ADMIN - read-only) - Already has AdminLayout inside */}
    <Route path="/admin/feedback" element={<AdminProtectedRoute><AdminLayout><AdminFeedbackPage /></AdminLayout></AdminProtectedRoute>} /> {/* Admin Feedback Moderation */}
  <Route path="/admin/profile" element={<AdminProtectedRoute><AdminLayout><AdminProfile /></AdminLayout></AdminProtectedRoute>} /> {/* Admin Profile */}
        {/* Feedback pages for Talent and HR */}
        <Route path="/talent/feedback" element={<ProtectedRoute><TalentLayout><TalentFeedbackPage /></TalentLayout></ProtectedRoute>} />
        <Route path="/hr/feedback" element={<ProtectedRoute><HRLayout><HRFeedbackPage /></HRLayout></ProtectedRoute>} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
};

export default App;
