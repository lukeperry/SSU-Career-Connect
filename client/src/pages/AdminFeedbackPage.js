import React from 'react';
import FeedbackAdminPanel from '../components/FeedbackAdminPanel';

const AdminFeedbackPage = () => {
  return (
    <div className="dashboard-container">
      <h1>Feedback Moderation</h1>
      <FeedbackAdminPanel />
    </div>
  );
};

export default AdminFeedbackPage;
