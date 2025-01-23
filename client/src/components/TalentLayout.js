import React from 'react';
import { Link } from 'react-router-dom';

const TalentLayout = ({ children }) => {
  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white">
        <ul className="flex space-x-4">
          <li><Link to="/talent/dashboard">Home</Link></li>
          <li><Link to="/talent/profile">Profile</Link></li>
          <li><Link to="/talent/job-board">Job Board</Link></li>
          <li><Link to="/talent/submitted-jobs">Submitted Jobs</Link></li>
          <li><Link to="/talent/messages">Messages</Link></li>
          <li><Link to="/" onClick={() => { localStorage.clear() }}>Logout</Link></li>
        </ul>
      </nav>
      <div className="container mx-auto mt-5">{children}</div>
    </div>
  );
};

export default TalentLayout;