// src/pages/AdminUserView.js
// Read-only user viewing for Government Administrators (GOVT_ADMIN)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import AdminLayout from '../components/AdminLayout';
import '../css/TalentDashboard.css';

const AdminUserView = () => {
  const [hrPartners, setHrPartners] = useState([]);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hr');
  const [counts, setCounts] = useState({
    totalHR: 0,
    activeHR: 0,
    totalTalents: 0,
    activeTalents: 0
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState(''); // 'hr' or 'talent'
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    
    // Check if user is logged in
    if (!token || !role) {
      alert('Please log in to access User View');
      navigate('/admin/login');
      return;
    }
    
    // Check if user is Government Admin or Platform Admin
    if (role !== 'GOVT_ADMIN' && role !== 'PLATFORM_ADMIN') {
      alert('Access Denied: Only Government and Platform Administrators can access User View');
      navigate('/admin/dashboard');
      return;
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchHRPartners(),
      fetchTalents()
    ]);
  };

  const fetchHRPartners = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/hr-partners`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setHrPartners(response.data.hrPartners || []);
      setCounts(prevCounts => ({
        ...prevCounts,
        totalHR: response.data.hrPartners?.length || 0,
        activeHR: response.data.hrPartners?.filter(hr => hr.isActive !== false).length || 0
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching HR partners:', error);
      setLoading(false);
    }
  };

  const fetchTalents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/talents`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTalents(response.data.talents || []);
      setCounts(prevCounts => ({
        ...prevCounts,
        totalTalents: response.data.talents?.length || 0,
        activeTalents: response.data.talents?.filter(t => t.isActive !== false).length || 0
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching talents:', error);
      setLoading(false);
    }
  };

  // Open profile modal
  const handleViewProfile = (user, type) => {
    setSelectedUser(user);
    setUserType(type);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
    setUserType('');
  };

  // Filter and search functions
  const filterAndSearchUsers = (users, isHR = false, isTalent = false) => {
    let filtered = [...users];

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => 
        isHR || isTalent ? user.isActive !== false : user.active
      );
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => 
        isHR || isTalent ? user.isActive === false : !user.active
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        if (isHR) {
          return (
            user.companyName?.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
          );
        } else if (isTalent) {
          return (
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.skills?.some(skill => skill.toLowerCase().includes(query))
          );
        }
        return false;
      });
    }

    return filtered;
  };

  return (
    <AdminLayout>
      <h1 className="page-title">User View (Read-Only)</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>ℹ️ Read-Only Access:</strong> You can view user information but cannot make changes. 
          Contact a Platform Administrator for user management operations.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-300">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setActiveTab('hr');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'hr'
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            HR Partners ({counts.totalHR})
          </button>
          <button
            onClick={() => {
              setActiveTab('talents');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'talents'
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Talents ({counts.totalTalents})
          </button>
        </div>
      </div>

      {/* HR Partners Tab */}
      {activeTab === 'hr' && (
        <>
          {/* HR Statistics - Clickable */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`bg-blue-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-blue-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-blue-800">{counts.totalHR || 0}</h3>
              <p className="text-sm text-gray-700">Total HR Partners</p>
            </button>
            <button 
              onClick={() => setStatusFilter('active')}
              className={`bg-emerald-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'active' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-emerald-800">{counts.activeHR || 0}</h3>
              <p className="text-sm text-gray-700">Active</p>
            </button>
            <button 
              onClick={() => setStatusFilter('inactive')}
              className={`bg-gray-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'inactive' ? 'ring-2 ring-gray-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-gray-800">{(counts.totalHR - counts.activeHR) || 0}</h3>
              <p className="text-sm text-gray-700">Inactive</p>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by company name, contact person, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* HR Partners List */}
          <div className="cards-container">
            <Card title={`HR Partners ${statusFilter !== 'all' ? `(${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})` : ''}`}>
              {loading ? (
                <p className="text-center p-6">Loading HR partners...</p>
              ) : filterAndSearchUsers(hrPartners, true, false).length === 0 ? (
                <p className="text-center p-6">No HR partners found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Company Name</th>
                        <th className="p-3 text-left">Contact Person</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filterAndSearchUsers(hrPartners, true, false) || []).map((hr) => (
                        <tr key={hr._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-semibold">{hr.companyName}</div>
                            <div className="text-xs text-gray-600">{hr.industry}</div>
                          </td>
                          <td className="p-3 text-sm">
                            <button
                              onClick={() => handleViewProfile(hr, 'hr')}
                              className="text-purple-600 hover:text-purple-800 hover:underline font-semibold cursor-pointer"
                            >
                              {hr.firstName} {hr.lastName}
                            </button>
                          </td>
                          <td className="p-3 text-sm">{hr.email}</td>
                          <td className="p-3 text-sm">{hr.phoneNumber}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hr.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {hr.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Talents Tab */}
      {activeTab === 'talents' && (
        <>
          {/* Talent Statistics - Clickable */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`bg-indigo-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-indigo-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-indigo-800">{counts.totalTalents || 0}</h3>
              <p className="text-sm text-gray-700">Total Talents</p>
            </button>
            <button 
              onClick={() => setStatusFilter('active')}
              className={`bg-emerald-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'active' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-emerald-800">{counts.activeTalents || 0}</h3>
              <p className="text-sm text-gray-700">Active</p>
            </button>
            <button 
              onClick={() => setStatusFilter('inactive')}
              className={`bg-gray-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'inactive' ? 'ring-2 ring-gray-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-gray-800">{(counts.totalTalents - counts.activeTalents) || 0}</h3>
              <p className="text-sm text-gray-700">Inactive</p>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* Talents List */}
          <div className="cards-container">
            <Card title={`Talents ${statusFilter !== 'all' ? `(${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})` : ''}`}>
              {loading ? (
                <p className="text-center p-6">Loading talents...</p>
              ) : filterAndSearchUsers(talents, false, true).length === 0 ? (
                <p className="text-center p-6">No talents found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">Skills</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filterAndSearchUsers(talents, false, true) || []).map((talent) => (
                        <tr key={talent._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <button
                              onClick={() => handleViewProfile(talent, 'talent')}
                              className="text-purple-600 hover:text-purple-800 hover:underline font-semibold cursor-pointer text-left"
                            >
                              {talent.firstName} {talent.lastName}
                            </button>
                            <div className="text-xs text-gray-600">{talent.location}</div>
                          </td>
                          <td className="p-3 text-sm">{talent.email}</td>
                          <td className="p-3 text-sm">{talent.phoneNumber}</td>
                          <td className="p-3 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {talent.skills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {talent.skills?.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  +{talent.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${talent.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {talent.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Profile View Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">
                {userType === 'hr' ? 'HR Partner Profile' : 'Talent Profile'}
              </h2>
              <button
                onClick={handleCloseProfileModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {userType === 'hr' ? (
              /* HR Partner Profile */
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.username || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Birthday</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                      <p className="p-2 bg-gray-100 rounded">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Company Jobs Posted</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.companyJobsPosted || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Account Created</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Talent Profile */
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Birthday</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.birthday ? new Date(selectedUser.birthday).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Civil Status</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.civilStatus || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills?.length > 0 ? (
                      selectedUser.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Education Level</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.educationLevel || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">School/University</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.school || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Degree</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.degree || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Major</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.major || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Graduation Year</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.graduationYear || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">SSU Graduate</label>
                      <p className="p-2 bg-gray-100 rounded">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.isSSUGraduate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedUser.isSSUGraduate ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Employment Status</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.employmentStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Years of Experience</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.yearsOfExperience || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Experience Description</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.experience || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Current Company</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.currentCompany || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Current Position</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.currentPosition || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Expected Salary</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.expectedSalary?.min && selectedUser.expectedSalary?.max 
                          ? `${selectedUser.expectedSalary.currency || 'PHP'} ${selectedUser.expectedSalary.min.toLocaleString()} - ${selectedUser.expectedSalary.max.toLocaleString()}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resume */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Resume</h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Resume File</label>
                    {selectedUser.resumeUrl ? (
                      <a 
                        href={selectedUser.resumeUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block p-3 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition font-semibold"
                      >
                        📄 View Resume
                      </a>
                    ) : (
                      <p className="p-2 bg-gray-100 rounded text-gray-500">No resume uploaded</p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Account Status</label>
                      <p className="p-2 bg-gray-100 rounded">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedUser.accountStatus || (selectedUser.isActive !== false ? 'Active' : 'Inactive')}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Profile Completion</label>
                      <p className="p-2 bg-gray-100 rounded">{selectedUser.profileCompletionPercentage || 0}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Last Active</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Joined Date</label>
                      <p className="p-2 bg-gray-100 rounded">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placement Tracking (if hired through platform) */}
                {selectedUser.hiredThroughPlatform && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-purple-600 border-b pb-2">Placement Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Hired Through Platform</label>
                        <p className="p-2 bg-green-100 rounded">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800">
                            Yes
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Hired Date</label>
                        <p className="p-2 bg-gray-100 rounded">
                          {selectedUser.hiredDate ? new Date(selectedUser.hiredDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Company</label>
                        <p className="p-2 bg-gray-100 rounded">{selectedUser.hiredCompany || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Position</label>
                        <p className="p-2 bg-gray-100 rounded">{selectedUser.hiredPosition || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleCloseProfileModal}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserView;
