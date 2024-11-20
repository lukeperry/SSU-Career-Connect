// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // Ensure you're fetching the correct key
  if (!token) {
    console.log('No token found, redirecting to home');
    return <Navigate to="/" />;
  }

  return children; // Render the children (HRDashboard, HRProfile, etc.) if token exists
};

export default ProtectedRoute;
