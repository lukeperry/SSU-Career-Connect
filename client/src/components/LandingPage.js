import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/LandingPage.css'; // Import the CSS file for styling

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen animated-gradient flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to CareerConnect</h1>
        <p className="text-lg text-white mb-8">Please choose your role:</p>
        <div className="space-x-4">
          <button
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-gray-200 transition"
            onClick={() => navigate("/hr")}
          >
            I am HR
          </button>
          <button
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-gray-200 transition"
            onClick={() => navigate("/talent")}
          >
            I am Talent
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
