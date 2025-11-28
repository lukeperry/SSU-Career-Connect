import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon from react-icons
import '../css/LandingPage.css'; // Import the CSS file for styling
import axios from "axios";

const HRLogin = () => {
  // Force cache bust - Version: 2025-10-28-v3
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved email only (never store passwords!)
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('hr_remembered_email');
    if (savedEmail) {
      setFormData({ email: savedEmail, password: '' });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted, starting login process...');
    setIsLoading(true);
    setMessage(""); // Clear any previous messages
    
    try {
      const apiUrl = `${process.env.REACT_APP_API_ADDRESS}/api/auth/login/hr`;
      console.log('API URL:', apiUrl);
      
      // Add timeout to prevent hanging
      const response = await axios.post(apiUrl, formData, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Login response received:', response.data);
      
      const { token, companyName, id } = response.data;
      
      if (!token || !id) {
        throw new Error('Invalid response from server');
      }
      
      setMessage("Login successful!");
      
      console.log('Saving to localStorage...');
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("companyName", companyName);
        localStorage.setItem("userId", id);
        localStorage.setItem("role", "hr");
        
        // Save or clear remembered email only (never store passwords!)
        if (rememberMe) {
          localStorage.setItem("hr_remembered_email", formData.email);
        } else {
          localStorage.removeItem("hr_remembered_email");
        }
        
        // Clean up any old password storage (security fix)
        localStorage.removeItem("hr_remembered_password");
        
        console.log('localStorage saved successfully');
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        alert('Failed to save login data. Please check browser settings.');
        setIsLoading(false);
        return;
      }
      
      console.log('Navigating to /hr/dashboard...');
      // Force immediate redirect
      window.location.replace("/hr/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = "Login failed. Please try again.";
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = "Request timeout. Please check your connection.";
      } else if (error.response) {
        errorMsg = error.response.data?.message || "Invalid credentials.";
      } else if (error.request) {
        errorMsg = "Cannot reach server. Please check your connection.";
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setMessage(errorMsg);
      console.error('Error details:', errorMsg);
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
          <h2 className="text-2xl font-bold">HR Login</h2>
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
            placeholder="your.email@example.com"
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
        <div className="mb-4 flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-gray-700">
            Remember me
          </label>
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-3 min-h-12 text-base font-bold rounded-lg transition ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'}`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {message && <p className={`mt-4 text-center font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
        <p className="mt-4 text-center text-sm">
          Don't have an account? <a href="/hr/register" className="text-blue-600 font-semibold">Register</a>
        </p>
      </form>
    </div>
  );
};

export default HRLogin;
