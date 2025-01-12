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

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/jobs`, {
          headers: { Authorization: `Bearer ${token}` }
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

  const closeModal = () => {
    setSelectedJob(null);
  };

  const deleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${process.env.REACT_APP_API_ADDRESS}/api/hr/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
      closeModal(); // Close the modal after deleting the job
    } catch (error) {
      setError("Failed to delete job.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="job-list-container">
      <h1>Posted Jobs under {localStorage.getItem('companyName')}</h1>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p>No posted jobs available.</p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => openModal(job)}
              tabIndex="0" // Make the div focusable
            />
          ))
        )}
      </div>
      {selectedJob && (
        <JobModal job={selectedJob} onClose={closeModal} onDelete={() => deleteJob(selectedJob._id)} />
      )}
    </div>
  );
};

export default HRPostedJobs;