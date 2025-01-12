// src/pages/TalentJobBoard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard"; // Assuming you have a JobCard component
import "../css/HRPostedJobs.css"; // Assuming you have a CSS file for styling

const TalentJobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sortedJobs = response.data.jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJobs(sortedJobs);
        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="job-list-container">
      <h1>Available Jobs</h1>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p>No jobs available.</p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => console.log(`Job clicked: ${job.title}`)} // Handle job click
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TalentJobBoard;
