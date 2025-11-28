// src/components/JobModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/JobModal.css'; // Import the CSS file for styling the modal

const JobModal = ({ job, onClose, onDelete, onApply }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role'); // Get user role

  const handleUpdate = () => {
    navigate(`/hr/edit-job/${job._id}`);
  };

  const handleViewApplicants = () => {
    navigate(`/hr/applicants/${job._id}`);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (onApply) {
      onApply(job._id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{job.title}</h2>
        
        <div className="modal-body">
          <p className="modal-field">
            <strong>Company:</strong>
            {job.companyName}
          </p>
          <p className="modal-field">
            <strong>Description:</strong>
            {job.description}
          </p>
          <p className="modal-field">
            <strong>Requirements:</strong>
            {job.requirements}
          </p>
          <p className="modal-field">
            <strong>Salary:</strong>
            {job.salary}
          </p>
          <p className="modal-field">
            <strong>Location:</strong>
            {job.location}
          </p>
          <p className="modal-field modal-skills">
            <strong>Required Skills:</strong>
            {job.requiredSkills.join(', ')}
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          
          {/* HR-only buttons */}
          {userRole === 'hr' && (
            <>
              <button onClick={handleViewApplicants} className="btn btn-primary">View Applicants</button>
              <button onClick={handleUpdate} className="btn btn-primary">Update Job</button>
              <button onClick={onDelete} className="btn btn-danger">Delete Job</button>
            </>
          )}

          {/* Talent-only buttons */}
          {userRole === 'talent' && onApply && (
            <button onClick={handleApplyClick} className="btn btn-primary">Apply for this Job</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobModal;