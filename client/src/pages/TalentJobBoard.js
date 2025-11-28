// src/pages/TalentJobBoard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import JobCard from "../components/JobCard"; // Assuming you have a JobCard component
import JobModal from "../components/JobModal"; // Import JobModal
import "../css/HRPostedJobs.css"; // Assuming you have a CSS file for styling
import Modal from 'react-modal';

const TalentJobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // For job details modal
  const [appliedJobIds, setAppliedJobIds] = useState([]); // Track applied job IDs
  const [currentPage, setCurrentPage] = useState(1); // Pagination for all jobs
  const [itemsPerPage, setItemsPerPage] = useState(20); // Items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all jobs
        const jobsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sortedJobs = jobsResponse.data.jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);

        // Fetch applied jobs to track which jobs user has already applied to
        const appliedResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/application/submitted`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const appliedIds = appliedResponse.data.applications
          .filter(app => app.jobId) // Only include applications with valid jobId
          .map(app => app.jobId._id);
        setAppliedJobIds(appliedIds);

        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    const confirmApply = window.confirm('Are you sure you want to apply for this job?');
    if (!confirmApply) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/application/job/${jobId}/apply`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Application successful!');
      
      // Add to applied jobs list
      setAppliedJobIds(prev => [...prev, jobId]);
    } catch (err) {
      console.error('Error applying for job:', err);
      if (err.response && err.response.data && err.response.data.message === 'You have already applied to this job.') {
        toast.error('You have already applied to this job.');
      } else {
        toast.error('Failed to apply for job.');
      }
    }
  };

  const handleMatchJobs = async () => {
    setIsCalculating(true);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/match/matches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Filter out jobs that user has already applied to
      const filteredMatches = response.data.filter(
        ({ job }) => !appliedJobIds.includes(job._id)
      );

      setRecommendedJobs(filteredMatches);
    } catch (err) {
      console.error('Error calculating match scores:', err);
      toast.error('Failed to calculate recommended jobs. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Pagination calculations
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

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
        <h1>Available Jobs</h1>
        <div className="jobs-info">
          <span className="total-count">Total: {totalJobs} jobs</span>
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
      
      <button onClick={handleMatchJobs} className="btn btn-primary match-jobs-btn">
        🎯 Find Recommended Jobs
      </button>
      
      <div className="job-list">
        {currentJobs.length === 0 ? (
          <p className="no-jobs">No jobs available.</p>
        ) : (
          (currentJobs || []).map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => handleJobClick(job)} // Handle job click
              onApply={handleApply} // Handle job application
            />
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Recommended Jobs"
        style={{
          overlay: {
            zIndex: 1500, /* Lower than JobModal's 2000 */
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
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden', /* Remove scrollbar from modal content */
            padding: 0,
            zIndex: 1500, /* Lower than JobModal's 2000 */
            borderRadius: '12px',
            border: 'none', /* Remove default border */
            background: 'transparent', /* Make background transparent */
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', /* Add floating shadow */
          },
        }}
      >
        <div className="modal-container">
          {/* Sticky Header with Close Button */}
          <div className="modal-header-sticky">
            <h2 className="recommended-jobs-title">
              {isCalculating ? '🔄 Calculating Matches...' : '✨ Recommended Jobs'}
            </h2>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="modal-close-btn"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="modal-content-area">
            {isCalculating ? (
              <div className="calculating-container">
                <div className="spinner"></div>
                <p className="calculating-text">Please wait...</p>
                <p className="calculating-subtext">
                  Analyzing jobs and calculating match scores
                </p>
              </div>
            ) : (
              <div className="recommended-jobs-list">
                {recommendedJobs.length === 0 ? (
                  <div className="no-jobs-message">
                    <p>😔 No new recommended jobs found.</p>
                    <p className="no-jobs-subtext">
                      {appliedJobIds.length > 0 
                        ? "You've already applied to all matching jobs. Check back later for new opportunities!"
                        : "Try updating your skills or experience in your profile to get better matches."}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="match-count">Found {recommendedJobs.length} job{recommendedJobs.length !== 1 ? 's' : ''} matching your profile (excluding applied jobs)</p>
                    {(recommendedJobs || []).map(({ job, score }) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        score={score}
                        onClick={() => handleJobClick(job)}
                        onApply={handleApply}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
};

export default TalentJobBoard;