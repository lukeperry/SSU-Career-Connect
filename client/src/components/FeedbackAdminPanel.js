import React, { useEffect, useState } from 'react';
import axios from 'axios';


const FeedbackAdminPanel = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.error
          ? `Failed to fetch feedback: ${err.response.data.error} (${err.response.status})`
          : 'Failed to fetch feedback.'
      );
      if (err?.response?.data) {
        console.error('Feedback fetch error details:', err.response.data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `/api/feedback/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeedbacks();
    } catch (err) {
      setError(
        err?.response?.data?.error
          ? `Failed to update feedback status: ${err.response.data.error} (${err.response.status})`
          : 'Failed to update feedback status.'
      );
      if (err?.response?.data) {
        console.error('Feedback status update error details:', err.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedbacks();
    } catch (err) {
      setError(
        err?.response?.data?.error
          ? `Failed to delete feedback: ${err.response.data.error} (${err.response.status})`
          : 'Failed to delete feedback.'
      );
      if (err?.response?.data) {
        console.error('Feedback delete error details:', err.response.data);
      }
    }
  };

  return (
    <div className="feedback-admin-panel" style={{ padding: '2rem', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 2px 8px #e5e7eb' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#1e293b' }}>Feedback Moderation</h2>
      {loading ? <p>Loading...</p> : null}
      {error && <div className="error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px #e5e7eb' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>User Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>Feedback</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>Rating</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => {
              // Prefer userName/userEmail fields if present, fallback to userId object for legacy data
              let userDisplay = 'N/A';
              if (fb.userName) {
                userDisplay = fb.userName;
              } else if (fb.userEmail) {
                userDisplay = fb.userEmail;
              } else if (fb.userId) {
                if (fb.userId.firstName || fb.userId.lastName) {
                  userDisplay = `${fb.userId.firstName || ''} ${fb.userId.lastName || ''}`.trim();
                } else if (fb.userId.email) {
                  userDisplay = fb.userId.email;
                }
              }
              return (
                <tr key={fb._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px', color: '#0f172a', fontWeight: 500 }}>{userDisplay}</td>
                  <td style={{ padding: '10px', color: '#334155' }}>{fb.userType}</td>
                  <td style={{ padding: '10px', color: '#334155', maxWidth: 300, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{fb.feedbackText}</td>
                  <td style={{ padding: '10px', color: '#334155' }}>{fb.rating || '-'}</td>
                  <td style={{ padding: '10px', color: fb.status === 'approved' ? '#16a34a' : fb.status === 'rejected' ? '#dc2626' : '#f59e42', fontWeight: 600 }}>{fb.status}</td>
                  <td style={{ padding: '10px' }}>
                    <>
                      <button onClick={() => handleStatusChange(fb._id, 'approved')} style={{ marginRight: 8, padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Approve</button>
                      <button onClick={() => handleStatusChange(fb._id, 'rejected')} style={{ marginRight: 8, padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Reject</button>
                      <button onClick={() => handleDelete(fb._id)} style={{ padding: '6px 14px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                    </>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackAdminPanel;
