import React from 'react';
import PropTypes from 'prop-types'; // For type checking

const JobCard = ({ job, onClick }) => {
  return (
    <div className="job-card" onClick={onClick}>
      <h3>{job.title}</h3>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default JobCard;
