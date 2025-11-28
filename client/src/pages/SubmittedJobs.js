// client/src/pages/SubmittedJobs.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import JobModal from '../components/JobModal'; // Use the same JobModal
import '../css/SubmittedJobs.css'; // Import the CSS file for styling

const SubmittedJobs = () => {
  const [submittedJobs, setSubmittedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
    if (job) {
      setSelectedJob(job);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

  const handleCancelApplication = async (applicationId, jobTitle) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel your application for "${jobTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmCancel) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}/api/application/${applicationId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the cancelled application from the state
      setSubmittedJobs(prev => prev.filter(app => app._id !== applicationId));
      
      alert('Application cancelled successfully');
    } catch (err) {
      console.error('Error cancelling application:', err);
      alert(err.response?.data?.message || 'Failed to cancel application. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="submitted-jobs">
        <h1><Skeleton width={300} /></h1>
        <div className="jobs-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="job-card">
              <Skeleton height={24} width={250} />
              <Skeleton height={16} width={150} style={{ marginTop: '10px' }} />
              <Skeleton height={16} count={3} style={{ marginTop: '5px' }} />
              <Skeleton height={40} style={{ marginTop: '15px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Pagination calculations
  const totalJobs = submittedJobs.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = submittedJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="job-list-container">
      <div className="jobs-header">
        <h1>Submitted Jobs</h1>
        <div className="jobs-info">
          <span className="total-count">Total: {totalJobs} applications</span>
          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Show:</label>
            <select 
              id="itemsPerPage" 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="job-list">
        {currentJobs.length === 0 ? (
          <p className="no-jobs">You haven't submitted any job applications yet.</p>
        ) : (
          currentJobs.map((application) => (
            <div 
              key={application._id} 
              className={`job-card ${!application.jobId ? 'deleted-job-card' : ''}`}
            >
              <div 
                onClick={() => application.jobId && openModal(application.jobId)}
                style={{ cursor: application.jobId ? 'pointer' : 'default' }}
                className="job-card-content"
              >
                {application.jobId ? (
                  <>
                    <h3>{application.jobId.title}</h3>
                    <p><strong>Company:</strong> {application.jobId.companyName}</p>
                    <p><strong>Location:</strong> {application.jobId.location}</p>
                    <p><strong>Salary:</strong> {application.jobId.salary || 'Not specified'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${application.status}`}>{application.status}</span></p>
                    <p><strong>Match Score:</strong> <span className={application.matchScore >= 0.75 ? 'high-score' : 'low-score'}>{Math.round(application.matchScore * 100)}%</span></p>
                    <p className="application-date"><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                    <p className="view-details-hint">Click to view full details →</p>
                  </>
                ) : (
                  <>
                    <h3 className="deleted-job-title">⚠️ Job No Longer Available</h3>
                    <p className="deleted-job-notice">This job has been deleted by the employer</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${application.status}`}>{application.status}</span></p>
                    <p><strong>Match Score:</strong> {Math.round(application.matchScore * 100)}%</p>
                    <p className="application-date"><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}</p>
                  </>
                )}
              </div>
              
              {/* Cancel Application Button */}
              <div className="card-actions">
                <button
                  className="cancel-application-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelApplication(
                      application._id,
                      application.jobId ? application.jobId.title : 'Deleted Job'
                    );
                  }}
                  title="Cancel this application"
                >
                  ✕ Cancel Application
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-numbers">
            {currentPage > 2 && (
              <>
                <button className="pagination-btn" onClick={() => handlePageChange(1)}>
                  1
                </button>
                {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {currentPage > 1 && (
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {currentPage - 1}
              </button>
            )}

            <button className="pagination-btn active">{currentPage}</button>

            {currentPage < totalPages && (
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                {currentPage + 1}
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SubmittedJobs;