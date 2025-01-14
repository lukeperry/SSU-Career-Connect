// HRLayout.js 
// This file refers to the menu buttons of the user.
import React from 'react';
import { Link } from 'react-router-dom';

const HRLayout = ({ children }) => {

  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white">
        <ul className="flex space-x-4">
          <li><Link to="/hr/dashboard">Home</Link></li>
          <li><Link to="/hr/profile">Profile</Link></li>
          <li><Link to="/hr/posted-jobs">Posted Jobs</Link></li>
          <li><Link to="/hr/post-job">Post a Job</Link></li>
          <li><Link to="/" onClick={() => { localStorage.clear() }}>Logout</Link></li>
        </ul>
      </nav>

      {/* This is where the page content will change */}
      <div className="container mx-auto mt-5">{children}</div>
    </div>
  );
};

export default HRLayout;
