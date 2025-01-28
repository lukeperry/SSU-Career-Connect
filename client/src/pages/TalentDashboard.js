// src/pages/TalentDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { messaging } from '../firebase'; // Import messaging
import '../css/TalentDashboard.css'; // Assuming you have a CSS file for styling

const TalentDashboard = () => {
  const [talentData, setTalentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [submittedJobs, setSubmittedJobs] = useState([]); // State for submitted jobs
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token

      try {
        const talentResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTalentData(talentResponse.data); // Save fetched data to state

        const notificationsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedNotifications = notificationsResponse.data.notifications
          ? notificationsResponse.data.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
          : [];
        setNotifications(sortedNotifications);

        const jobsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedJobs = jobsResponse.data.jobs
          ? jobsResponse.data.jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
          : [];
        setRecentJobs(sortedJobs);

        const submittedJobsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/application/submitted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedJobs(submittedJobsResponse.data.applications || []);

        // Fetch and cache recommended jobs
        const matchResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/match/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("recommendedJobs", JSON.stringify(matchResponse.data));
      } catch (error) {
        console.error('Error fetching Talent dashboard data:', error);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (messaging && messaging.onMessage) {
      const unsubscribe = messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
        // Update notifications state with the new notification
        setNotifications((prevNotifications) => [payload.notification, ...prevNotifications].slice(0, 5));
      });

      return () => unsubscribe();
    }
  }, []);

  const handleNotificationClick = (senderId) => {
    navigate(`/talent/messages?user=${senderId}`);
  };

  const handleJobClick = () => {
    navigate(`/talent/job-board`);
  };

  const handleSubmittedJobClick = () => {
    navigate(`/talent/submitted-jobs`);
  };

  return (
    <div className="dashboard-container">
      <h1>Talent Dashboard</h1>
      {error && <p>{error}</p>}
      {talentData ? (
        <div className="greeting-container">
          <h2 className="greeting-text">Hello {talentData.firstName},</h2>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className="cards-container">
        <Card title="Notifications">
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index} className="notification-box" onClick={() => handleNotificationClick(notification.senderId)}>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications</p>
          )}
        </Card>
        <Card title="Recently Posted Jobs">
          {recentJobs.length > 0 ? (
            <ul>
              {recentJobs.map((job) => (
                <li key={job._id} className="item-card" onClick={handleJobClick}>
                  {job.title} | {job.companyName}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent jobs</p>
          )}
        </Card>
        <Card title="Submitted Jobs">
          {submittedJobs.length > 0 ? (
            <ul>
              {submittedJobs.map((application) => (
                <li key={application._id} className="item-card" onClick={handleSubmittedJobClick}>
                  <p>{application.jobId.title} | {application.jobId.companyName}</p>
                  <p className={`status ${application.status}`}>Status: {application.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No submitted jobs</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TalentDashboard;
