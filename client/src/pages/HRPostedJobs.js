import React, { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard"; // Assuming you have a JobCard component
import JobModal from "../components/JobModal"; // Assuming you have a JobModal component
import "../css/HRPostedJobs.css"; // Assuming you have a CSS file for styling

const HRPostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const companyName = localStorage.getItem('companyName'); // Fetch HR's company from localStorage
        const filteredJobs = response.data.jobs.filter(job => job.companyName === companyName);
        const sortedJobs = filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}/api/hr/jobs/${selectedJob._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setMessage("Job deleted successfully!");
      // Remove the deleted job from the list
      setJobs(jobs.filter(job => job._id !== selectedJob._id));
      // Close the modal
      setSelectedJob(null);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete job.");
      console.error("Error deleting job:", err.response ? err.response.data : err.message);
    }
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
        <h1>Posted Jobs</h1>
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
      
      {message && <div className="success-message">{message}</div>}
      
      <div className="job-list">
        {currentJobs.length === 0 ? (
          <p className="no-jobs">No jobs available.</p>
        ) : (
          currentJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => openModal(job)} // Handle job click
              // Do not pass onApply prop to avoid displaying the Apply button
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

      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default HRPostedJobs;
