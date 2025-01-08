import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard'; // Separate component for job card
import JobModal from '../components/JobModal'; // Modal component for job details
import '../css/HRPostedJobs.css';  // Import the CSS file with the correct extension

const HRPostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null); // State to manage selected job for modal

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('./api/jobs', {
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

  const closeModal = () => {
    setSelectedJob(null);
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
        <JobModal job={selectedJob} onClose={closeModal} />
      )}
    </div>
  );
};

export default HRPostedJobs;
