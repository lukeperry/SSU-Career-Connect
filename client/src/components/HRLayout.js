// HRLayout.js 
// This file refers to the menu buttons of the user.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import MobileBottomNav from './MobileBottomNav';
import '../css/Navigation.css';

const HRLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white hr-nav">
        <div className="nav-header">
          <h2 className="nav-logo">CareerConnect</h2>
          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/hr/dashboard" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/hr/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
          <li><Link to="/hr/posted-jobs" onClick={() => setMenuOpen(false)}>Posted Jobs</Link></li>
          <li><Link to="/hr/post-job" onClick={() => setMenuOpen(false)}>Post a Job</Link></li>
          <li><Link to="/hr/messages" onClick={() => setMenuOpen(false)}>Messages</Link></li>
          <li><Link to="/hr/feedback" onClick={() => setMenuOpen(false)}>Feedback</Link></li>
          <li>
            <Link 
              to="/" 
              onClick={() => { 
                localStorage.clear(); 
                setMenuOpen(false); 
              }}
            >
              Logout
            </Link>
          </li>
        </ul>
      </nav>
      <div className="container mx-auto mt-5 main-content">{children}</div>
      <MobileBottomNav role="hr" />
    </div>
  );
};

export default HRLayout;
