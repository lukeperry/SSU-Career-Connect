import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon from react-icons
import '../css/LandingPage.css'; // Import the CSS file for styling

const HRPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen animated-gradient flex items-center justify-center">
      <div className="text-center relative pt-16"> {/* Added padding-top to create space for the button */}
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="absolute top-0 left-0 text-3xl text-white m-4" // Decreased size to text-3xl
        >
          <FaArrowLeft />
        </button>
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
