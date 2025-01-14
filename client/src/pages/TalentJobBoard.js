// src/pages/TalentJobBoard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard"; // Assuming you have a JobCard component
import "../css/HRPostedJobs.css"; // Assuming you have a CSS file for styling
import Modal from 'react-modal';

const TalentJobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleMatchJobs = async () => {
    setIsCalculating(true);
    setIsModalOpen(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 100); // Adjust the interval timing as needed

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/match/matches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const sortedMatches = response.data;
      setRecommendedJobs(sortedMatches);
    } catch (err) {
      console.error('Error calculating match scores:', err);
    } finally {
      clearInterval(interval);
      setProgress(100); // Ensure progress is set to 100% when done
      setIsCalculating(false);
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
      <h1>Available Jobs</h1>
      <button onClick={handleMatchJobs} className="btn btn-primary">Find Recommended Jobs</button>
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Recommended Jobs"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '80vh', // Set maximum height
            overflowY: 'auto', // Enable vertical scrolling
          },
        }}
      >
        {isCalculating ? (
          <div>
            <div className="loading-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{progress}%</p>
          </div>
        ) : (
          <div>
            <h2 className="recommended-jobs-title">Recommended Jobs</h2>
            {recommendedJobs.length === 0 ? (
              <p>No recommended jobs found.</p>
            ) : (
              recommendedJobs.map(({ job, score }) => (
                <JobCard
                  key={job._id}
                  job={job}
                  score={score} // Pass the score to the JobCard component
                  onClick={() => console.log(`Recommended Job clicked: ${job.title}`)} // Handle job click
                />
              ))
            )}
          </div>
        )}
        <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Close</button>
      </Modal>
    </div>
  );
};

export default TalentJobBoard;