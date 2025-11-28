
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedbackList = ({ userType }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');

        // Use /api/feedback/public for all non-admin users
        const endpoint = '/api/feedback/public';
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let feedbacks = res.data;

        // Fetch profile using the same API as profile viewing
        const withProfilePics = await Promise.all(feedbacks.map(async fb => {
          if (fb.profilePicture && fb.userName) return fb;
          try {
            let profilePic = '';
            let name = '';
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            if (fb.userType === 'talent') {
              const resp = await axios.get(`/api/talent/profile/${fb.userId}`, authHeader);
              profilePic = resp.data?.profilePicture || '';
              name = resp.data?.firstName && resp.data?.lastName ? `${resp.data.firstName} ${resp.data.lastName}` : '';
            } else if (fb.userType === 'hr') {
              const resp = await axios.get(`/api/hr/profile/${fb.userId}`, authHeader);
              profilePic = resp.data?.profilePicture || '';
              name = resp.data?.firstName && resp.data?.lastName ? `${resp.data.firstName} ${resp.data.lastName}` : '';
            }
            return { ...fb, profilePicture: profilePic, userName: name || fb.userName };
          } catch {
            return { ...fb, profilePicture: '', userName: fb.userName };
          }
        }));
        setFeedbacks(withProfilePics);
      } catch (err) {
        setError('Failed to fetch feedback.');
      }
      setLoading(false);
    };
    fetchFeedbacks();
  }, [userType]);

  if (loading) return <p>Loading feedback...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (feedbacks.length === 0) return <p>No feedback yet.</p>;


  return (
    <div style={{ marginTop: '2rem', background: '#f9fafb', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 4px #e5e7eb' }}>
      <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Recent Feedback</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {feedbacks.map(fb => (
          <div key={fb._id} style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 400, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              {fb.profilePicture ? (
                <img src={fb.profilePicture} alt="Profile" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: 14, border: '2px solid #f59e42' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e5e7eb', marginRight: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b', fontSize: 22 }}>
                  {fb.userName ? fb.userName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 18 }}>{fb.userName || fb.userEmail}</span>
                  <span style={{ color: '#f59e42', fontWeight: 500, fontSize: 15 }}>★ {fb.rating || '-'}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                  {fb.userType === 'talent' ? 'Talent' : fb.userType === 'hr' ? 'HR Partner' : ''}
                </div>
              </div>
            </div>
            <div style={{ color: '#334155', margin: '0.5rem 0', fontSize: 16 }}>{fb.feedbackText}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
