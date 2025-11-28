
import React, { useState } from 'react';
import axios from 'axios';

import '../css/FeedbackForm.css';
const API_BASE = process.env.REACT_APP_API_ADDRESS || '';

const FeedbackForm = ({ userType }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const role = localStorage.getItem('role');
    if (role !== 'talent' && role !== 'hr') {
      setError('Only talent and hr users can submit feedback.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/feedback`,
        { feedbackText, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Thank you for your feedback!');
      setFeedbackText('');
      setRating(5);
    } catch (err) {
      console.error('Feedback submission error:', err, err?.response?.data);
      let errorMsg = 'Failed to submit feedback. Please try again.';
      if (err?.response?.data?.message) {
        errorMsg += ` (${err.response.data.message})`;
      } else if (err?.response?.data?.error) {
        errorMsg += ` (${err.response.data.error})`;
      }
      setError(errorMsg);
    }
  };

  return (
    <div className="feedback-form-container">
      <h2>Share Your Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="feedbackText">Your Experience or Success Story:</label>
          <textarea
            id="feedbackText"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            required
            rows={4}
            placeholder="Tell us about your experience..."
          />
        </div>
        <div>
          <label htmlFor="rating">Rating:</label>
          <select
            id="rating"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
          >
            {[5,4,3,2,1].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        <button type="submit">Submit Feedback</button>
      </form>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FeedbackForm;
