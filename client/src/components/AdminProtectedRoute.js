// src/components/AdminProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole');

  const allowedRoles = ['PLATFORM_ADMIN', 'GOVT_ADMIN', 'SSU_ADMIN'];
  if (!adminToken || !allowedRoles.includes(role)) {
    console.log('No admin token found or not an allowed admin role, redirecting to admin login');
    return <Navigate to="/admin/login" />;
  }

  return children; // Render the children (AdminDashboard, AdminProfile, etc.) if adminToken exists
};

export default AdminProtectedRoute;
