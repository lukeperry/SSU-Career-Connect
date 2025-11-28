import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import '../css/LandingPage.css';

// Set app element for accessibility
Modal.setAppElement('#root');

const LandingPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');

      // If user has valid session data, redirect to their dashboard
      if (token && role && userId) {
        console.log('User is already logged in. Redirecting to dashboard...');
        if (role === 'hr') {
          navigate('/hr/dashboard', { replace: true });
        } else if (role === 'talent') {
          navigate('/talent/dashboard', { replace: true });
        }
      } else {
        // No valid session, show landing page
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="h-screen animated-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen animated-gradient flex items-center justify-center landing-page-mobile">
      <div className="text-center landing-content">
        <h1 className="landing-title">Welcome to CareerConnect</h1>
        <p className="landing-subtitle">Please choose your role:</p>
        <div className="landing-buttons">
          <button
            className="landing-btn landing-btn-hr"
            onClick={() => navigate("/hr")}
          >
            I am HR
          </button>
          <button
            className="landing-btn landing-btn-talent"
            onClick={() => navigate("/talent")}
          >
            I am Talent
          </button>
          <button
            className="landing-btn landing-btn-admin"
            onClick={() => navigate("/admin/login")}
          >
            Admin Login
          </button>
        </div>
        
        {/* About This Project Button */}
        <div className="about-button-container">
          <button
            className="about-btn"
            onClick={openModal}
          >
            About This Project
          </button>
        </div>
      </div>

      {/* About Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="About This Project"
        style={{
          overlay: {
            zIndex: 2000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            padding: 0,
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <div className="modal-container">
          {/* Sticky Header with Close Button */}
          <div className="about-modal-header-sticky">
            <h2 className="about-modal-header-title">About CareerConnect</h2>
            <button 
              onClick={closeModal} 
              className="about-modal-close-btn"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="about-modal-content-area">
            <p className="about-description">
              CareerConnect is a comprehensive career platform designed to bridge the gap between 
              SSU (Samar State University) graduates and students with industry partners. Our platform 
              features an intelligent job matching algorithm that calculates match scores based on job 
              descriptions and skills. For talents, the algorithm analyzes your profile skills against 
              job requirements, while for HR partners, it matches candidate qualifications with their 
              desired criteria, ensuring the best possible connections.
            </p>

            <div className="demo-accounts-section">
              <h3 className="section-title">Demo Accounts</h3>
              
              <div className="demo-account-card">
                <h4 className="account-type">HR Account</h4>
                <div className="account-details">
                  <p><strong>Email:</strong> janedoe@acme.com</p>
                  <p><strong>Password:</strong> 12345678</p>
                </div>
              </div>

              <div className="demo-account-card">
                <h4 className="account-type">Talent Account</h4>
                <div className="account-details">
                  <p><strong>Email:</strong> johndoe@talent.com</p>
                  <p><strong>Password:</strong> 12345678</p>
                </div>
              </div>
            </div>

            <div className="capstone-section">
              <h3 className="section-title">Capstone Project by:</h3>
              <div className="creators-list">
                <p className="creator-name">Luke Perry Z. Buenaventura</p>
                <p className="creator-name">Aloja Lauronal</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
