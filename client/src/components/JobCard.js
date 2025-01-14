// This component displays all the posted jobs within the company in a card format

import React from 'react';
import PropTypes from 'prop-types'; // For type checking
import '../css/JobCard.css'; // Assuming you have a CSS file for styling

const JobCard = ({ job, score, onClick, onApply }) => {
  const getScoreClass = (score) => {
    if (score >= 0.75) {
      return 'high-score';
    } else {
      return 'low-score';
    }
  };

  const userRole = localStorage.getItem('role'); // Fetch user role from local storage

  return (
    <div className="job-card" onClick={onClick}>
      <h3>{job.title}</h3>
      <p><strong>Company:</strong> {job.companyName}</p>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
      <p><strong>Status:</strong> {job.status}</p> {/* Display job status */}
      {score !== undefined && (
        <p className={getScoreClass(score)}><strong>Match Score:</strong> {Math.round(score * 100)}%</p>
      )}
      {userRole === 'talent' && ( // Conditionally render the Apply button
        <button onClick={(e) => { e.stopPropagation(); onApply(job._id); }} className="btn btn-primary">Apply</button>
      )}
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  score: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

export default JobCard;
