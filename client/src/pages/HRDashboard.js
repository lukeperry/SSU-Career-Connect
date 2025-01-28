// src/pages/HRDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import '../css/TalentDashboard.css'; // Assuming you have a CSS file for styling

const HRDashboard = () => {
  const [hrData, setHrData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token

      try {
        const hrResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHrData(hrResponse.data); // Save fetched data to state

        const notificationsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedNotifications = notificationsResponse.data.notifications
          ? notificationsResponse.data.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
          : [];
        setNotifications(sortedNotifications);

        const applicationsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/application/hr`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedApplications = applicationsResponse.data.applications
          ? applicationsResponse.data.applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 5)
          : [];
        setApplications(sortedApplications);
      } catch (error) {
        console.error('Error fetching HR dashboard data:', error);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, []);

  const handleNotificationClick = (senderId) => {
    navigate(`/hr/messages?user=${senderId}`);
  };

  const handleApplicationClick = (jobId) => {
    navigate(`/hr/applicants/${jobId}`);
  };

  return (
    <div className="dashboard-container">
      <h1>HR Dashboard</h1>
      {error && <p>{error}</p>}
      {hrData ? (
        <div className="greeting-container">
          <h2 className="greeting-text">Hello {hrData.firstName},</h2>
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
        <Card title="Recent Applications">
          {applications.length > 0 ? (
            <ul>
              {applications.map((application) => (
                <li key={application._id} className="item-card" onClick={() => handleApplicationClick(application.jobId._id)}>
                  <p>{application.talentId.firstName} {application.talentId.lastName} has applied for {application.jobId.title}</p>
                  <p><small>Applied on: {new Date(application.appliedAt).toLocaleString()}</small></p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent applications</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
