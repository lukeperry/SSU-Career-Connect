import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/LandingPage.css'; // Import the CSS file for styling
import axios from "axios";

const HRRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    companyName: "",
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
      const response = await axios.post("http://localhost:5000/api/auth/register/hr", formData);
      console.log(response.data); // Optional: Log or process the response
      setMessage("Registration successful! Please log in.");
      setFormData({ username: "", email: "", password: "", companyName: "" });
      navigate("/hr/login");
    } catch (error) {
      setMessage("Registration failed. Please check your details.");
    }
  };

  return (
    <div className="h-screen animated-gradient flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4">HR Registration</h2>
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
        <div className="mb-4">
          <label className="block mb-1 font-bold">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default HRRegister;
