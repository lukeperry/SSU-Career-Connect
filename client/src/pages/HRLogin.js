import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon from react-icons
import '../css/LandingPage.css'; // Import the CSS file for styling
import axios from "axios";

const HRLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/auth/login/hr`, formData);
      const { token, companyName, id } = response.data;
      console.log(response.data); // Log the server's response or process it
      setMessage(response.data.message || "Login successful!");
      
      // Save the token or user data to localStorage or context if needed
      localStorage.setItem("token", token);
      localStorage.setItem("companyName", companyName);
      localStorage.setItem("userId", id);
      localStorage.setItem("role", "hr");
      
      // Redirect to HR dashboard after successful login
      navigate("/hr/dashboard");
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="h-screen animated-gradient flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex items-center mb-4">
          <button type="button" onClick={() => navigate(-1)} className="mr-2">
            <FaArrowLeft className="text-blue-600" />
          </button>
          <h2 className="text-2xl font-bold">HR Login</h2>
        </div>
        {message && <p className="text-red-500 mb-4">{message}</p>}
        <div className="mb-4">
          <label className="block mb-1 font-bold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
};

export default HRLogin;
