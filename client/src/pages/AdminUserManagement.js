// src/pages/AdminUserManagement.js
// Only accessible by Platform Admins
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaTrash } from 'react-icons/fa';
import Card from '../components/Card';
import AdminLayout from '../components/AdminLayout';
import '../css/TalentDashboard.css';

const AdminUserManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [hrPartners, setHrPartners] = useState([]);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admins');
  const [counts, setCounts] = useState({
    platform: 0,
    govt: 0,
    ssu: 0,
    active: 0,
    inactive: 0,
    totalHR: 0,
    activeHR: 0,
    totalTalents: 0,
    activeTalents: 0
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'SSU_ADMIN',
    organization: '',
    department: ''
  });
  
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    userId: '',
    userType: '', // 'admin', 'hr', or 'talent'
    userName: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState({
    userId: '',
    userType: '', // 'admin', 'hr', or 'talent'
    userName: '',
    adminPassword: ''
  });
  
  // Profile view modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUserType, setViewUserType] = useState(''); // 'hr' or 'talent'
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    
    // Check if user is logged in
    if (!token || !role) {
      alert('Please log in to access User Management');
      navigate('/admin/login');
      return;
    }
    
    // Check if user is Platform Admin
    if (role !== 'PLATFORM_ADMIN') {
      alert('Access Denied: Only Platform Administrators can access User Management');
      navigate('/admin/dashboard');
      return;
    }

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchAdmins(),
      fetchHRPartners(),
      fetchTalents()
    ]);
  };

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/admins`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAdmins(response.data.admins || []);
      setCounts(prevCounts => ({
        ...prevCounts,
        platform: response.data.adminsByRole?.PLATFORM_ADMIN?.length || 0,
        govt: response.data.adminsByRole?.GOVT_ADMIN?.length || 0,
        ssu: response.data.adminsByRole?.SSU_ADMIN?.length || 0,
        active: response.data.admins?.filter(a => a.active).length || 0,
        inactive: response.data.admins?.filter(a => !a.active).length || 0
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      
      // If unauthorized, clear storage and redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        alert('Your session has expired. Please log in again.');
        navigate('/admin/login');
        return;
      }
      
      setMessage({ type: 'error', text: 'Failed to load admin accounts' });
      setLoading(false);
    }
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
        totalHR: response.data.total || 0,
        activeHR: response.data.hrPartners?.filter(hr => hr.isActive !== false).length || 0
      }));
    } catch (error) {
      console.error('Error fetching HR partners:', error);
      // Silent fail for now - endpoint may not exist yet
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
        totalTalents: response.data.total || 0,
        activeTalents: response.data.talents?.filter(t => t.isActive !== false).length || 0
      }));
    } catch (error) {
      console.error('Error fetching talents:', error);
      // Silent fail for now - endpoint may not exist yet
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/admins`,
        newAdmin,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Admin account created successfully!' });
      setShowCreateModal(false);
      setNewAdmin({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'SSU_ADMIN',
        organization: '',
        department: ''
      });
      
      fetchAllData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create admin account' 
      });
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const currentUserId = localStorage.getItem('userId');
    
    if (adminId === currentUserId) {
      alert('You cannot deactivate your own account!');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/admins/${adminId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `Admin account ${currentStatus ? 'deactivated' : 'activated'} successfully!` 
      });
      
      fetchAllData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update admin status' 
      });
    }
  };

  const handleToggleHRStatus = async (hrId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/hr-partners/${hrId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `HR Partner ${currentStatus ? 'deactivated' : 'activated'} successfully!` 
      });
      
      fetchAllData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update HR partner status' 
      });
    }
  };

  const handleToggleTalentStatus = async (talentId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/users/talents/${talentId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `Talent ${currentStatus ? 'deactivated' : 'activated'} successfully!` 
      });
      
      fetchAllData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update talent status' 
      });
    }
  };

  const handleOpenPasswordReset = (userId, userType, userName) => {
    setPasswordResetData({
      userId,
      userType,
      userName,
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordResetModal(true);
  };

  const handlePasswordReset = async () => {
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (passwordResetData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = `/api/admin/users/${passwordResetData.userType}s/${passwordResetData.userId}/reset-password`;
      
      await axios.patch(
        `${process.env.REACT_APP_API_ADDRESS}${endpoint}`,
        { newPassword: passwordResetData.newPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `Password reset successfully for ${passwordResetData.userName}!` 
      });
      
      setShowPasswordResetModal(false);
      setPasswordResetData({
        userId: '',
        userType: '',
        userName: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password' 
      });
    }
  };

  // Delete user handlers
  const handleOpenDeleteModal = (userId, userType, userName) => {
    setDeleteData({
      userId,
      userType,
      userName,
      adminPassword: ''
    });
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    // Validate admin password is entered
    if (!deleteData.adminPassword) {
      setMessage({ type: 'error', text: 'Please enter your admin password to confirm deletion' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = `/api/admin/users/${deleteData.userType}s/${deleteData.userId}/delete`;
      
      await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { adminPassword: deleteData.adminPassword }
        }
      );

      setMessage({ 
        type: 'success', 
        text: `${deleteData.userName} has been permanently deleted!` 
      });
      
      setShowDeleteModal(false);
      setDeleteData({
        userId: '',
        userType: '',
        userName: '',
        adminPassword: ''
      });
      
      // Refresh the data
      fetchAllData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete user. Please check your password.' 
      });
    }
  };

  // View user profile
  const handleViewProfile = (user, type) => {
    setSelectedUser(user);
    setViewUserType(type);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
    setViewUserType('');
  };

  // Filter and search functions
  const filterAndSearchUsers = (users, isHR = false, isTalent = false) => {
    let filtered = [...users];

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => 
        isHR || isTalent ? user.isActive : user.active
      );
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => 
        isHR || isTalent ? !user.isActive : !user.active
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
        } else {
          // Admin search
          return (
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.organization?.toLowerCase().includes(query)
          );
        }
      });
    }

    return filtered;
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'SSU_ADMIN': 'SSU Administrator',
      'GOVT_ADMIN': 'Government Administrator',
      'PLATFORM_ADMIN': 'Platform Administrator'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'PLATFORM_ADMIN': 'bg-purple-100 text-purple-800',
      'GOVT_ADMIN': 'bg-blue-100 text-blue-800',
      'SSU_ADMIN': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <h1 className="page-title">User Management</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-300">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setActiveTab('admins');
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'admins'
                ? 'border-b-4 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Admin Accounts
          </button>
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

      {/* Admin Tab */}
      {activeTab === 'admins' && (
        <>
          {/* Statistics - Clickable */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`bg-purple-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-purple-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-purple-800">{(counts.platform + counts.govt + counts.ssu) || 0}</h3>
              <p className="text-sm text-gray-700">Total Admins</p>
            </button>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-blue-800">{counts.govt || 0}</h3>
              <p className="text-sm text-gray-700">Govt Admins</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-yellow-800">{counts.ssu || 0}</h3>
              <p className="text-sm text-gray-700">SSU Admins</p>
            </div>
            <button 
              onClick={() => setStatusFilter('active')}
              className={`bg-emerald-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'active' ? 'ring-2 ring-emerald-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-emerald-800">{counts.active || 0}</h3>
              <p className="text-sm text-gray-700">Active</p>
            </button>
            <button 
              onClick={() => setStatusFilter('inactive')}
              className={`bg-gray-100 p-4 rounded-lg text-left transition-all hover:shadow-md ${statusFilter === 'inactive' ? 'ring-2 ring-gray-600' : ''}`}
            >
              <h3 className="text-2xl font-bold text-gray-800">{counts.inactive || 0}</h3>
              <p className="text-sm text-gray-700">Inactive</p>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, username, email, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* Create Admin Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              + Create New Admin Account
            </button>
          </div>

          {/* Create Admin Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Create New Admin Account</h2>
                
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-bold text-sm">First Name *</label>
                      <input
                        type="text"
                        value={newAdmin.firstName}
                        onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
                        required
                        className="w-full p-2 border-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-sm">Last Name *</label>
                      <input
                        type="text"
                        value={newAdmin.lastName}
                        onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                        required
                        className="w-full p-2 border-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-sm">Username *</label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      required
                      className="w-full p-2 border-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-sm">Email *</label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      required
                      className="w-full p-2 border-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-sm">Role *</label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                      required
                      className="w-full p-2 border-2 rounded-lg"
                    >
                      <option value="SSU_ADMIN">SSU Administrator</option>
                      <option value="GOVT_ADMIN">Government Administrator (DOLE/PESO)</option>
                      <option value="PLATFORM_ADMIN">Platform Administrator</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      {newAdmin.role === 'GOVT_ADMIN' && 'For DOLE/PESO accounts, specify organization below'}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-sm">Organization *</label>
                    <input
                      type="text"
                      value={newAdmin.organization}
                      onChange={(e) => setNewAdmin({...newAdmin, organization: e.target.value})}
                      required
                      placeholder="e.g., DOLE, PESO, SSU"
                      className="w-full p-2 border-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-sm">Department (Optional)</label>
                    <input
                      type="text"
                      value={newAdmin.department}
                      onChange={(e) => setNewAdmin({...newAdmin, department: e.target.value})}
                      placeholder="e.g., Regional Office 8"
                      className="w-full p-2 border-2 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-bold text-sm">Password *</label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                        required
                        minLength="6"
                        className="w-full p-2 border-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-sm">Confirm Password *</label>
                      <input
                        type="password"
                        value={newAdmin.confirmPassword}
                        onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                        required
                        minLength="6"
                        className="w-full p-2 border-2 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                      Create Admin Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setMessage({ type: '', text: '' });
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admin Accounts List */}
          <div className="cards-container">
            <Card title={`Admin Accounts ${statusFilter !== 'all' ? `(${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})` : ''}`}>
              {loading ? (
                <p className="text-center p-6">Loading admin accounts...</p>
              ) : filterAndSearchUsers(admins).length === 0 ? (
                <p className="text-center p-6">No admin accounts found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Organization</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filterAndSearchUsers(admins) || []).map((admin) => (
                        <tr key={admin._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-semibold">{admin.firstName} {admin.lastName}</div>
                            <div className="text-sm text-gray-600">@{admin.username}</div>
                          </td>
                          <td className="p-3 text-sm">{admin.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(admin.role)}`}>
                              {getRoleDisplay(admin.role)}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            {admin.organization}
                            {admin.department && <div className="text-xs text-gray-600">{admin.department}</div>}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {admin.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleToggleStatus(admin._id, admin.active)}
                                className={`px-3 py-1 rounded text-sm font-semibold ${
                                  admin.active 
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                                disabled={admin._id === localStorage.getItem('userId')}
                              >
                                {admin.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleOpenPasswordReset(admin._id, 'admin', `${admin.firstName} ${admin.lastName}`)}
                                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                title="Reset Password"
                              >
                                <FaLock />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(admin._id, 'admin', `${admin.firstName} ${admin.lastName}`)}
                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                title="Delete User"
                                disabled={admin._id === localStorage.getItem('userId')}
                              >
                                <FaTrash />
                              </button>
                            </div>
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
                        <th className="p-3 text-center">Actions</th>
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
                            <span 
                              onClick={() => handleViewProfile(hr, 'hr')}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                            >
                              {hr.firstName} {hr.lastName}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{hr.email}</td>
                          <td className="p-3 text-sm">{hr.phoneNumber}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hr.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {hr.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleToggleHRStatus(hr._id, hr.isActive !== false)}
                                className={`px-3 py-1 rounded text-sm font-semibold ${
                                  hr.isActive !== false
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {hr.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleOpenPasswordReset(hr._id, 'hr', `${hr.firstName} ${hr.lastName}`)}
                                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                title="Reset Password"
                              >
                                <FaLock />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(hr._id, 'hr', `${hr.firstName} ${hr.lastName}`)}
                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                title="Delete User"
                              >
                                <FaTrash />
                              </button>
                            </div>
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
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(filterAndSearchUsers(talents, false, true) || []).map((talent) => (
                        <tr key={talent._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div 
                              onClick={() => handleViewProfile(talent, 'talent')}
                              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {talent.firstName} {talent.lastName}
                            </div>
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
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleToggleTalentStatus(talent._id, talent.isActive !== false)}
                                className={`px-3 py-1 rounded text-sm font-semibold ${
                                  talent.isActive !== false
                                    ? 'bg-red-500 text-white hover:bg-red-600' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                              >
                                {talent.isActive !== false ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleOpenPasswordReset(talent._id, 'talent', `${talent.firstName} ${talent.lastName}`)}
                                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                title="Reset Password"
                              >
                                <FaLock />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(talent._id, 'talent', `${talent.firstName} ${talent.lastName}`)}
                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                title="Delete User"
                              >
                                <FaTrash />
                              </button>
                            </div>
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

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Reset Password</h2>
            <p className="mb-4 text-gray-600">
              Resetting password for: <span className="font-semibold">{passwordResetData.userName}</span>
            </p>

            {message.type && (
              <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-sm">New Password *</label>
                <input
                  type="password"
                  value={passwordResetData.newPassword}
                  onChange={(e) => setPasswordResetData({...passwordResetData, newPassword: e.target.value})}
                  className="w-full p-2 border-2 rounded-lg"
                  placeholder="Enter new password"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">Confirm Password *</label>
                <input
                  type="password"
                  value={passwordResetData.confirmPassword}
                  onChange={(e) => setPasswordResetData({...passwordResetData, confirmPassword: e.target.value})}
                  className="w-full p-2 border-2 rounded-lg"
                  placeholder="Confirm new password"
                  minLength="6"
                />
              </div>

              <p className="text-xs text-gray-600">
                * Password must be at least 6 characters long
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordReset}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold"
              >
                Reset Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordResetModal(false);
                  setPasswordResetData({
                    userId: '',
                    userType: '',
                    userName: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-red-700">⚠️ Delete User</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to <span className="font-bold text-red-600">permanently delete</span> this user?
            </p>
            <p className="mb-4 font-semibold text-lg">
              {deleteData.userName}
            </p>
            <p className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded">
              ⚠️ This action cannot be undone. All user data will be permanently removed.
            </p>

            {message.type && (
              <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-sm">Enter Your Admin Password to Confirm *</label>
                <input
                  type="password"
                  value={deleteData.adminPassword}
                  onChange={(e) => setDeleteData({...deleteData, adminPassword: e.target.value})}
                  className="w-full p-2 border-2 border-red-300 rounded-lg focus:border-red-500"
                  placeholder="Your admin password"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold"
              >
                Delete User
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteData({
                    userId: '',
                    userType: '',
                    userName: '',
                    adminPassword: ''
                  });
                  setMessage({ type: '', text: '' });
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {viewUserType === 'hr' ? 'HR Partner' : 'Talent'} Profile
              </h2>
              <button
                onClick={handleCloseProfileModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="relative">
                  {selectedUser.profilePicture ? (
                    <img
                      src={selectedUser.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const initialsDiv = e.target.nextSibling;
                        if (initialsDiv) {
                          initialsDiv.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200"
                    style={{ 
                      display: selectedUser.profilePicture ? 'none' : 'flex'
                    }}
                  >
                    {selectedUser.firstName?.charAt(0) || ''}{selectedUser.lastName?.charAt(0) || ''}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-medium">{selectedUser.phoneNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Location</label>
                    <p className="font-medium">{selectedUser.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* HR Specific Information */}
              {viewUserType === 'hr' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Company Name</label>
                      <p className="font-medium">{selectedUser.companyName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Position</label>
                      <p className="font-medium">{selectedUser.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Industry</label>
                      <p className="font-medium">{selectedUser.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Company Size</label>
                      <p className="font-medium">{selectedUser.companySize || 'Not specified'}</p>
                    </div>
                  </div>
                  {selectedUser.companyDescription && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">Company Description</label>
                      <p className="font-medium">{selectedUser.companyDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Talent Specific Information */}
              {viewUserType === 'talent' && (
                <>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Education</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">School/University</label>
                        <p className="font-medium">{selectedUser.school || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Degree/Program</label>
                        <p className="font-medium">{selectedUser.degree || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Graduation Year</label>
                        <p className="font-medium">{selectedUser.graduationYear || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.experience && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Experience</h3>
                      <p className="whitespace-pre-wrap">{selectedUser.experience}</p>
                    </div>
                  )}

                  {selectedUser.documents && selectedUser.documents.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Documents</h3>
                      <div className="space-y-2">
                        {selectedUser.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-blue-600">📄</span>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {doc.filename}
                            </a>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <p className="font-medium">
                      <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Profile Completion</label>
                    <p className="font-medium">{selectedUser.profileCompletionPercentage || 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseProfileModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
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

export default AdminUserManagement;
