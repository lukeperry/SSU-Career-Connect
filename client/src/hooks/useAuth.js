// src/hooks/useAuth.js
// Custom hook to check authentication and redirect if not logged in

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Check if user is authenticated and redirect to login if not
 * @param {string} requiredRole - The role required ('hr', 'talent', 'admin')
 * @param {string} loginRoute - The route to redirect to if not authenticated
 */
export const useAuth = (requiredRole, loginRoute = '/') => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Check if user is logged in
    if (!token || !role) {
      console.log(`No token or role found. Redirecting to ${loginRoute}`);
      navigate(loginRoute);
      return;
    }

    // Check if user has the correct role
    if (requiredRole && role !== requiredRole) {
      console.log(`Role mismatch. Expected: ${requiredRole}, Got: ${role}`);
      alert('Access Denied: You do not have permission to access this page');
      navigate(loginRoute);
      return;
    }

    // User is authenticated with correct role
    console.log(`Authentication verified. Role: ${role}`);
  }, [requiredRole, loginRoute, navigate]);
};

/**
 * Check if admin is authenticated and has specific admin role
 * @param {string} requiredAdminRole - The admin role required ('PLATFORM_ADMIN', 'SSU_ADMIN', 'GOVT_ADMIN')
 * @param {string} loginRoute - The route to redirect to if not authenticated
 */
export const useAdminAuth = (requiredAdminRole = null, loginRoute = '/admin/login') => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('role');
    const adminRole = localStorage.getItem('adminRole');

    // Check if user is logged in as admin
    if (!token || role !== 'admin' || !adminRole) {
      console.log('Not authenticated as admin. Redirecting to login');
      navigate(loginRoute);
      return;
    }

    // Check if user has the specific admin role required
    if (requiredAdminRole && adminRole !== requiredAdminRole) {
      console.log(`Admin role mismatch. Expected: ${requiredAdminRole}, Got: ${adminRole}`);
      alert('Access Denied: You do not have permission to access this page');
      navigate('/admin/dashboard');
      return;
    }

    // User is authenticated with correct admin role
    console.log(`Admin authentication verified. Admin Role: ${adminRole}`);
  }, [requiredAdminRole, loginRoute, navigate]);
};

export default useAuth;
