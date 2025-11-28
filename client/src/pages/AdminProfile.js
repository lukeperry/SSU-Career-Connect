// src/pages/AdminProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import '../css/TalentDashboard.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    organization: '',
    department: ''
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAdminData(response.data);
      setEditedData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
      setLoading(false);
      
      // Fallback to localStorage
      setAdminData({
        username: localStorage.getItem('username') || '',
        firstName: localStorage.getItem('firstName') || '',
        lastName: localStorage.getItem('lastName') || '',
        email: localStorage.getItem('email') || '',
        role: localStorage.getItem('adminRole') || '',
        organization: localStorage.getItem('organization') || '',
        department: localStorage.getItem('department') || ''
      });
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditedData({ ...adminData });
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData({ ...adminData });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/profile`,
        {
          firstName: editedData.firstName,
          lastName: editedData.lastName,
          organization: editedData.organization,
          department: editedData.department
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update localStorage
      localStorage.setItem('firstName', response.data.admin.firstName);
      localStorage.setItem('lastName', response.data.admin.lastName);
      localStorage.setItem('organization', response.data.admin.organization);
      if (response.data.admin.department) {
        localStorage.setItem('department', response.data.admin.department);
      }

      setAdminData(response.data.admin);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaving(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
      setSaving(false);
    }
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'SSU_ADMIN': return 'SSU Administrator';
      case 'GOVT_ADMIN': return 'Government Administrator';
      case 'PLATFORM_ADMIN': return 'Platform Administrator';
      default: return 'Administrator';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Admin Profile</h1>
        <div className="text-center p-10">
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Profile</h1>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="cards-container">
        <Card title="Profile Information">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <p className="p-2 bg-gray-100 rounded">{adminData.username}</p>
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <p className="p-2 bg-gray-100 rounded">{adminData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded focus:border-purple-600 focus:outline-none"
                  />
                ) : (
                  <p className="p-2 bg-gray-100 rounded">{adminData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded focus:border-purple-600 focus:outline-none"
                  />
                ) : (
                  <p className="p-2 bg-gray-100 rounded">{adminData.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <p className="p-2 bg-blue-100 rounded font-semibold text-blue-800">
                  {getRoleDisplay(adminData.role)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Organization</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.organization}
                    onChange={(e) => setEditedData({...editedData, organization: e.target.value})}
                    className="w-full p-2 border-2 border-gray-300 rounded focus:border-purple-600 focus:outline-none"
                  />
                ) : (
                  <p className="p-2 bg-gray-100 rounded">{adminData.organization}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData.department || ''}
                    onChange={(e) => setEditedData({...editedData, department: e.target.value})}
                    placeholder="Optional"
                    className="w-full p-2 border-2 border-gray-300 rounded focus:border-purple-600 focus:outline-none"
                  />
                ) : (
                  <p className="p-2 bg-gray-100 rounded">{adminData.department || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold disabled:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card title="Security Settings">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Password</h3>
              <p className="text-gray-600 mb-4">
                Change your password to keep your account secure.
              </p>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition font-semibold"
              >
                Change Password
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-2">Account Information</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Account Type:</strong> {getRoleDisplay(adminData.role)}</p>
                <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Active</span></p>
                <p><strong>Last Login:</strong> {adminData.lastLogin ? new Date(adminData.lastLogin).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            
            {message.text && (
              <div className={`mb-4 p-3 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block mb-1 font-bold text-sm">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  className="w-full p-2 border-2 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength="6"
                  className="w-full p-2 border-2 rounded-lg focus:border-purple-600 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength="6"
                  className="w-full p-2 border-2 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition font-semibold disabled:bg-gray-400"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={saving}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
