// src/pages/AdminAnalytics.js
import React from 'react';
import AnalyticsDashboard from '../components/Admin/AnalyticsDashboard';
import '../css/TalentDashboard.css';

const AdminAnalytics = () => {
  return (
    <div style={{ width: '100vw', maxWidth: '100%', margin: 0, padding: 0 }}>
      <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', letterSpacing: '-1px', marginLeft: 0, marginRight: 0 }}>
        Analytics Dashboard
      </h1>
      <div style={{ width: '100vw', maxWidth: '100%', margin: 0, padding: 0 }}>
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AdminAnalytics;
