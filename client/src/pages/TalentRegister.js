import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon from react-icons
import '../css/LandingPage.css'; // Import the CSS file for styling

const TalentRegister = () => {
  const [formData, setFormData] = useState({
    username: "", // Add username field
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    email: "",
    phoneNumber: "",
    password: "", // Add password field
    confirmPassword: "", // Add confirm password field
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/auth/register/talent`, formData);
      console.log(response.data); // Optional: Log or process the response
      setMessage("Registration successful! Please log in.");
      setFormData({
        username: "", // Reset username field
        firstName: "",
        lastName: "",
        birthday: "",
        gender: "",
        email: "",
        phoneNumber: "",
        password: "", // Reset password field
        confirmPassword: "", // Reset confirm password field
      });
      navigate("/talent/login");
    } catch (error) {
      console.error("Error during registration:", error);
      // Display the actual error message from the server
      const errorMessage = error.response?.data?.message || "Registration failed. Please check your details.";
      setMessage(errorMessage);
    }
  };

  return (
    <div className="h-screen animated-gradient flex items-center justify-center f-inherit">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96 f-inherit f-margin">
        <div className="flex items-center mb-4">
          <button type="button" onClick={() => navigate(-1)} className="mr-2">
            <FaArrowLeft className="text-blue-600" />
          </button>
          <h2 className="text-2xl font-bold">Talent Registration</h2>
        </div>
        {message && <p className="text-red-500 mb-4">{message}</p>}
        <div className="mb-4">
          <label className="block mb-1 font-bold">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
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
          <label className="block mb-1 font-bold">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
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
        <div className="mb-4">
          <label className="block mb-1 font-bold">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  );
};

export default TalentRegister;