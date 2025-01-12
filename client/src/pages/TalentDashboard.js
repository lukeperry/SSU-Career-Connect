// src/pages/TalentDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import '../css/TalentDashboard.css'; // Assuming you have a CSS file for styling

const TalentDashboard = () => {
  const [talentData, setTalentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

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
        setNotifications(notificationsResponse.data.notifications);

        const messagesResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(messagesResponse.data.messages);

        const jobsResponse = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentJobs(jobsResponse.data.jobs.slice(0, 5)); // Get the 5 most recent jobs
      } catch (error) {
        console.error('Error fetching Talent dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Talent Dashboard</h1>
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
              {notifications.map((notification) => (
                <li key={notification._id}>{notification.message}</li>
              ))}
            </ul>
          ) : (
            <p>No notifications</p>
          )}
        </Card>
        <Card title="Messages">
          {messages.length > 0 ? (
            <ul>
              {messages.map((message) => (
                <li key={message._id}>{message.content}</li>
              ))}
            </ul>
          ) : (
            <p>No messages</p>
          )}
        </Card>
        <Card title="Recently Posted Jobs">
          {recentJobs.length > 0 ? (
            <ul>
              {recentJobs.map((job) => (
                <li key={job._id}>{job.title}</li>
              ))}
            </ul>
          ) : (
            <p>No recent jobs</p>
          )}
        </Card>
        <Card title="Blank Card">
          <p>Content goes here</p>
        </Card>
      </div>
    </div>
  );
};

export default TalentDashboard;
