import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import MobileBottomNav from './MobileBottomNav';
import '../css/Navigation.css';

const TalentLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white talent-nav">
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
          <li><Link to="/talent/dashboard" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/talent/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
          <li><Link to="/talent/job-board" onClick={() => setMenuOpen(false)}>Job Board</Link></li>
          <li><Link to="/talent/submitted-jobs" onClick={() => setMenuOpen(false)}>Submitted Jobs</Link></li>
          <li><Link to="/talent/messages" onClick={() => setMenuOpen(false)}>Messages</Link></li>
          <li><Link to="/talent/feedback" onClick={() => setMenuOpen(false)}>Feedback</Link></li>
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
      <MobileBottomNav role="talent" />
    </div>
  );
};

export default TalentLayout;