// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import '../css/TalentDashboard.css'; // Reusing the same CSS for consistent styling

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    totalTalents: 0,
    totalHRPartners: 0,
    totalJobs: 0,
    totalApplications: 0,
    ssuGraduates: 0,
    activeJobs: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      const adminRole = localStorage.getItem('adminRole');
      const organization = localStorage.getItem('organization');

      // Set admin data from localStorage
      setAdminData({
        firstName,
        lastName,
        role: adminRole,
        organization
      });

      try {
        // Fetch real dashboard statistics from API
        const response = await axios.get(
          `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/dashboard/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setStats(response.data.stats);
        console.log('✅ Dashboard stats loaded:', response.data.stats);

        // Temporary mock data for recent activity (can be replaced with real data later)
        setRecentActivity([
          { id: 1, type: 'System', message: 'Dashboard statistics updated', timestamp: new Date() }
        ]);

      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setError('Error fetching dashboard data');
        
        // Fallback to mock data if API fails
        setStats({
          totalTalents: 0,
          totalHRPartners: 0,
          totalJobs: 0,
          totalApplications: 0,
          ssuGraduates: 0,
          activeJobs: 0
        });
      }
    };

    fetchData();
  }, []);

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'SSU_ADMIN': return 'SSU Administrator';
      case 'GOVT_ADMIN': return 'Government Administrator';
      case 'PLATFORM_ADMIN': return 'Platform Administrator';
      default: return 'Administrator';
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {adminData ? (
        <div className="greeting-container">
          <h2 className="greeting-text">Hello {adminData.firstName},</h2>
          <p className="text-white">
            {getRoleDisplay(adminData.role)} • {adminData.organization}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-blue-800">{stats.totalTalents}</h3>
          <p className="text-gray-700">Total Talents</p>
          {stats.activeTalents !== undefined && (
            <p className="text-sm text-gray-600">{stats.activeTalents} active</p>
          )}
        </div>
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-green-800">{stats.totalHRPartners}</h3>
          <p className="text-gray-700">HR Partners</p>
          {stats.activeHRPartners !== undefined && (
            <p className="text-sm text-gray-600">{stats.activeHRPartners} active</p>
          )}
        </div>
        <div className="bg-purple-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-purple-800">{stats.totalJobs}</h3>
          <p className="text-gray-700">Total Jobs</p>
          <p className="text-sm text-gray-600">{stats.activeJobs} active</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-yellow-800">{stats.totalApplications}</h3>
          <p className="text-gray-700">Total Applications</p>
        </div>
        <div className="bg-indigo-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-indigo-800">{stats.ssuGraduates}</h3>
          <p className="text-gray-700">SSU Graduates</p>
        </div>
        <div className="bg-pink-100 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-pink-800">
            {stats.totalJobs > 0 ? ((stats.totalApplications / stats.totalJobs) || 0).toFixed(1) : '0'}
          </h3>
          <p className="text-gray-700">Avg Applications/Job</p>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="cards-container">
        <Card title="Recent Activity">
          {recentActivity.length > 0 ? (
            <ul>
              {recentActivity.map((activity) => (
                <li key={activity.id} className="notification-box">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-600">{activity.type}</p>
                      <p>{activity.message}</p>
                    </div>
                    <small className="text-gray-500">{new Date(activity.timestamp).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity</p>
          )}
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              View Analytics
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Generate Reports
            </button>
            {['PLATFORM_ADMIN', 'SSU_ADMIN'].includes(adminData?.role) && (
              <>
                {adminData?.role === 'PLATFORM_ADMIN' && (
                  <button 
                    onClick={() => navigate('/admin/user-management')}
                    className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
                  >
                    Manage Users
                  </button>
                )}
                <button
                  onClick={() => navigate('/admin/feedback')}
                  className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Moderate Feedback
                </button>
              </>
            )}
            <button 
              onClick={() => navigate('/admin/profile')}
              className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              Edit Profile
            </button>
          </div>
        </Card>
      </div>

      {/* System Information */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Your Role</p>
            <p className="font-semibold">{getRoleDisplay(adminData?.role)}</p>
          </div>
          <div>
            <p className="text-gray-600">Organization</p>
            <p className="font-semibold">{adminData?.organization}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Login</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Access Level</p>
            <p className="font-semibold">
              {adminData?.role === 'PLATFORM_ADMIN' ? 'Full Access' : 
               adminData?.role === 'GOVT_ADMIN' ? 'Government Access' : 'SSU Access'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
