import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../css/LandingPage.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SSU_ADMIN',
    organization: 'Samar State University',
    department: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/admin/auth/register`, {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organization: formData.organization,
        department: formData.department
      });

      setMessage('Registration successful!');

      // Store admin data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('adminRole', response.data.admin.role);
      localStorage.setItem('userId', response.data.admin.id);
      localStorage.setItem('username', response.data.admin.username);
      localStorage.setItem('firstName', response.data.admin.firstName);
      localStorage.setItem('lastName', response.data.admin.lastName);
      localStorage.setItem('organization', response.data.admin.organization);

      // Redirect to admin dashboard
      window.location.replace('/admin/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen animated-gradient flex items-center justify-center login-container-mobile">
      <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: '500px' }}>
        <div className="flex items-center mb-4">
          <button type="button" onClick={() => navigate(-1)} className="mr-2 back-button">
            <FaArrowLeft className="text-blue-600" />
          </button>
          <h2 className="text-2xl font-bold">Admin Registration</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block mb-1 font-bold text-sm" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block mb-1 font-bold text-sm" htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full p-2 border-2 rounded-lg text-base"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-sm" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border-2 rounded-lg text-base"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-sm" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@ssu.edu.ph"
            className="w-full p-2 border-2 rounded-lg text-base"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-sm" htmlFor="role">Admin Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-2 border-2 rounded-lg text-base"
          >
            <option value="SSU_ADMIN">SSU Administrator</option>
            <option value="GOVT_ADMIN">Government Administrator (DOLE/PESO)</option>
            <option value="PLATFORM_ADMIN">Platform Administrator</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-sm" htmlFor="organization">Organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            placeholder="e.g., Samar State University"
            className="w-full p-2 border-2 rounded-lg text-base"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-bold text-sm" htmlFor="department">Department (Optional)</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Career Services Office"
            className="w-full p-2 border-2 rounded-lg text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block mb-1 font-bold text-sm" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full p-2 border-2 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block mb-1 font-bold text-sm" htmlFor="confirmPassword">Confirm</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full p-2 border-2 rounded-lg text-base"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-3 min-h-12 text-base font-bold rounded-lg transition ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'} text-white`}
        >
          {isLoading ? 'Creating Account...' : 'Create Admin Account'}
        </button>
        
        {message && <p className={`mt-4 text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/admin/login" className="text-blue-600 font-semibold">Login</a>
        </p>
      </form>
    </div>
  );
};

export default AdminRegister;
