import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/LandingPage.css'; // Import the CSS file for styling

const HRPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen animated-gradient flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">HR Portal</h1>
        <div className="space-x-4">
          <button
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-gray-200 transition"
            onClick={() => navigate("/hr/login")}
          >
            Login
          </button>
          <button
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-gray-200 transition"
            onClick={() => navigate("/hr/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRPage;
