// AdminLayout.js 
// Admin navigation layout with conditional User Management for Platform Admins only
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../css/Navigation.css';

const AdminLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminRole, setAdminRole] = useState('');

  useEffect(() => {
    // Get admin role from localStorage
    const role = localStorage.getItem('adminRole');
    setAdminRole(role);
  }, []);

  const isPlatformAdmin = adminRole === 'PLATFORM_ADMIN';
  const isGovtAdmin = adminRole === 'GOVT_ADMIN';

  return (
    <div>
      <nav className="bg-gray-800 p-4 text-white admin-nav">
        <div className="nav-header">
          <h2 className="nav-logo">CareerConnect Admin</h2>
          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
          <li><Link to="/admin/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link></li>
          <li><Link to="/admin/reports" onClick={() => setMenuOpen(false)}>Reports</Link></li>
          {isPlatformAdmin && (
            <li><Link to="/admin/user-management" onClick={() => setMenuOpen(false)}>User Management</Link></li>
          )}
          {isGovtAdmin && (
            <li><Link to="/admin/user-view" onClick={() => setMenuOpen(false)}>User View</Link></li>
          )}
          <li><Link to="/admin/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
          <li>
            <Link 
              to="/admin/login" 
              onClick={() => { 
                // Clear all admin-related data
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRole');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                // Or clear everything
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
    </div>
  );
};

export default AdminLayout;
