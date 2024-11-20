import React from "react";
import { useNavigate } from "react-router-dom";

const TalentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Talent Portal</h1>
      <div className="space-y-4">
        <button
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-lg shadow hover:bg-indigo-600 transition"
          onClick={() => navigate("/talent/login")}
        >
          Login
        </button>
        <button
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-lg shadow hover:bg-indigo-600 transition"
          onClick={() => navigate("/talent/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default TalentPage;
