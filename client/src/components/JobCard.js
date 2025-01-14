// This component displays all the posted jobs within the company in a card format

import React from 'react';
import PropTypes from 'prop-types'; // For type checking
import '../css/JobCard.css'; // Assuming you have a CSS file for styling

const JobCard = ({ job, score, onClick }) => {
  const getScoreClass = (score) => {
    if (score >= 0.75) {
      return 'high-score';
    } else {
      return 'low-score';
    }
  };

  return (
    <div className="job-card" onClick={onClick}>
      <h3>{job.title}</h3>
      <p><strong>Company:</strong> {job.companyName}</p>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
      {score !== undefined && (
        <p className={getScoreClass(score)}><strong>Match Score:</strong> {Math.round(score * 100)}%</p>
      )}
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  score: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

export default JobCard;
