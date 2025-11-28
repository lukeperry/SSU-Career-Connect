// This component displays all the posted jobs within the company in a card format

import React from 'react';
import PropTypes from 'prop-types'; // For type checking
import '../css/JobCard.css'; // Assuming you have a CSS file for styling

const JobCard = ({ job, score, onClick, onApply }) => {
  // Enhanced scoring system with color-coded recommendations
  const getScoreInfo = (score) => {
    if (score >= 0.85) {
      return {
        class: 'score-perfect',
        label: 'Excellent Match',
        message: "You're an excellent fit! Apply now.",
        color: '#10b981', // Green
        recommended: true
      };
    } else if (score >= 0.70) {
      return {
        class: 'score-excellent',
        label: 'Great Match',
        message: "You're a strong candidate. We recommend applying.",
        color: '#22c55e', // Light Green
        recommended: true
      };
    } else if (score >= 0.55) {
      return {
        class: 'score-good',
        label: 'Good Match',
        message: 'You meet many requirements. Consider applying.',
        color: '#f59e0b', // Orange/Yellow
        recommended: true
      };
    } else if (score >= 0.40) {
      return {
        class: 'score-moderate',
        label: 'Moderate Match',
        message: "Some qualifications match. Apply if you're passionate.",
        color: '#f97316', // Orange
        recommended: false
      };
    } else if (score >= 0.25) {
      return {
        class: 'score-low',
        label: 'Low Match',
        message: 'Limited match. Consider developing more relevant skills.',
        color: '#ef4444', // Red/Orange
        recommended: false
      };
    } else {
      return {
        class: 'score-poor',
        label: 'Poor Match',
        message: 'This role may not align with your profile.',
        color: '#dc2626', // Red
        recommended: false
      };
    }
  };

  const userRole = localStorage.getItem('role'); // Fetch user role from local storage
  const scoreInfo = score !== undefined ? getScoreInfo(score) : null;

  return (
    <div className="job-card" onClick={onClick}>
      <h3>{job.title}</h3>
      <p><strong>Company:</strong> {job.companyName}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
      <p><strong>Status:</strong> <span className={`status-badge status-${job.status}`}>{job.status}</span></p>
      
      {scoreInfo && (
        <div className="match-score-section">
          <div className={`match-score ${scoreInfo.class}`} style={{ borderLeftColor: scoreInfo.color }}>
            <div className="score-header">
              <span className="score-percentage" style={{ color: scoreInfo.color }}>
                {Math.round(score * 100)}%
              </span>
              <span className="score-label" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </span>
            </div>
            <p className="score-message">{scoreInfo.message}</p>
          </div>
        </div>
      )}
      
      {userRole === 'talent' && scoreInfo && ( // Conditionally render the Apply button
        <button 
          onClick={(e) => { e.stopPropagation(); onApply(job._id); }} 
          className={`btn ${scoreInfo.recommended ? 'btn-primary' : 'btn-secondary'}`}
          style={scoreInfo.recommended ? { backgroundColor: scoreInfo.color, borderColor: scoreInfo.color } : {}}
        >
          {scoreInfo.recommended ? '✓ Apply Now' : 'Apply Anyway'}
        </button>
      )}
      
      <p className="view-details-hint">Click to view full details →</p>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  score: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  onApply: PropTypes.func, // Not required - only needed for talent role
};

export default JobCard;
