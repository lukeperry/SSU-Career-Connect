// src/components/JobModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/JobModal.css'; // Import the CSS file for styling the modal

const JobModal = ({ job, onClose }) => {
  const navigate = useNavigate();

  const handleUpdate = () => {
    navigate(`/hr/edit-job/${job._id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{job.title}</h2>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Requirements:</strong> {job.requirements}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Required Skills:</strong> {job.requiredSkills.join(', ')}</p>
        <button onClick={onClose} className="btn btn-secondary">Close</button>
        <button onClick={handleUpdate} className="btn btn-primary">Update</button>
      </div>
    </div>
  );
};

export default JobModal;