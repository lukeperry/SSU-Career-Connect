import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../css/LandingPage.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState(false);

  // Check if registration is allowed
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/registration-status`);
        setRegistrationAllowed(response.data.registrationAllowed);
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };
    checkRegistrationStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/login`, formData);

      setMessage('Login successful!');

      // Store admin data in localStorage
      localStorage.setItem('adminToken', response.data.token); // Changed from 'token' to 'adminToken'
      localStorage.setItem('role', 'admin');
      localStorage.setItem('adminRole', response.data.admin.role);
      localStorage.setItem('userId', response.data.admin.id);
      localStorage.setItem('username', response.data.admin.username);
      localStorage.setItem('email', response.data.admin.email); // Added email
      localStorage.setItem('firstName', response.data.admin.firstName);
      localStorage.setItem('lastName', response.data.admin.lastName);
      localStorage.setItem('organization', response.data.admin.organization);
      localStorage.setItem('department', response.data.admin.department || ''); // Added department

      // Redirect to admin dashboard
      window.location.replace('/admin/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen animated-gradient flex items-center justify-center login-container-mobile">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="flex items-center mb-4">
          <button type="button" onClick={() => navigate(-1)} className="mr-2 back-button">
            <FaArrowLeft className="text-blue-600" />
          </button>
          <h2 className="text-2xl font-bold">Admin Login</h2>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@ssu.edu.ph"
            className="w-full p-3 border-2 rounded-lg text-base"
            aria-label="Email address"
            aria-required="true"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full p-3 border-2 rounded-lg text-base"
            aria-label="Password"
            aria-required="true"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-3 min-h-12 text-base font-bold rounded-lg transition ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'} text-white`}
        >
          {isLoading ? 'Logging in...' : 'Login as Admin'}
        </button>
        {message && <p className={`mt-4 text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        {registrationAllowed && (
          <p className="mt-4 text-center text-sm">
            Don't have an admin account? <a href="/admin/register" className="text-blue-600 font-semibold">Register</a>
          </p>
        )}
        <p className="mt-2 text-center text-xs text-gray-600">
          <strong>Roles:</strong> SSU Admin, DOLE Admin, Platform Admin
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
