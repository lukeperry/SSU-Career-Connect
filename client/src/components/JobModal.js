// src/components/JobModal.js
import React from 'react';
import '../css/JobModal.css'; // Import the CSS file for styling the modal

const JobModal = ({ job, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{job.title}</h2>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Requirements:</strong> {job.requirements}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Required Skills:</strong> {job.requiredSkills.join(', ')}</p>
        <button onClick={onClose} className="btn btn-secondary">Close</button>
        <button onClick={() => alert('Update functionality to be implemented')} className="btn btn-primary">Update</button>
      </div>
    </div>
  );
};

export default JobModal;