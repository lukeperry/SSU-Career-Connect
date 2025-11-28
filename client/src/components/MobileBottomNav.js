import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBriefcase, FaEnvelope, FaUser } from 'react-icons/fa';
import '../css/MobileBottomNav.css';

const MobileBottomNav = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const talentNavItems = [
    { path: '/talent/dashboard', icon: FaHome, label: 'Home' },
    { path: '/talent/job-board', icon: FaBriefcase, label: 'Jobs' },
    { path: '/talent/messages', icon: FaEnvelope, label: 'Messages' },
    { path: '/talent/profile', icon: FaUser, label: 'Profile' },
  ];

  const hrNavItems = [
    { path: '/hr/dashboard', icon: FaHome, label: 'Home' },
    { path: '/hr/posted-jobs', icon: FaBriefcase, label: 'Jobs' },
    { path: '/hr/messages', icon: FaEnvelope, label: 'Messages' },
    { path: '/hr/profile', icon: FaUser, label: 'Profile' },
  ];

  const navItems = role === 'talent' ? talentNavItems : hrNavItems;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
