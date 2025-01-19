// client/src/pages/SubmittedJobs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from 'react-modal';
import '../css/SubmittedJobs.css'; // Import the CSS file for styling

const SubmittedJobs = () => {
  const [submittedJobs, setSubmittedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchSubmittedJobs = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/application/submitted`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmittedJobs(response.data.applications);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching submitted jobs:', err);
        setError('Failed to load submitted jobs.');
        setLoading(false);
      }
    };

    fetchSubmittedJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedJob(null);
  };

  if (loading) {
    return <p>Loading submitted jobs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="submitted-jobs-container">
      <h2 className="submitted-jobs-header">Submitted Jobs</h2>
      <div className="submitted-jobs-list">
        {submittedJobs.map((application) => (
          <div key={application._id} className="submitted-job-card">
            <h3 className="job-title">{application.jobId.title}</h3>
            <p><strong>Company:</strong> {application.jobId.companyName}</p>
            <p className={`status ${application.status}`}>Status: {application.status}</p>
            <p><strong>Score:</strong> {Math.round(application.matchScore * 100)}%</p>
            <p><strong>Applied At:</strong> {new Date(application.appliedAt).toLocaleString()}</p>
            <button onClick={() => openModal(application.jobId)} className="btn btn-link">View Job</button>
          </div>
        ))}
      </div>

      {selectedJob && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Job Details"
          className="job-modal"
          overlayClassName="job-modal-overlay"
        >
          <h2 className="modal-job-title">{selectedJob.title}</h2>
          <p><strong>Company:</strong> {selectedJob.companyName}</p>
          <p><strong>Description:</strong> {selectedJob.description}</p>
          <p><strong>Location:</strong> {selectedJob.location}</p>
          <p><strong>Requirements:</strong> {selectedJob.requirements}</p>
          <p><strong>Required Skills:</strong> {selectedJob.requiredSkills.join(', ')}</p>
          <div className="modal-close-button-container">
            <button onClick={closeModal} className="btn btn-secondary">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubmittedJobs;