import React from 'react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';

const TalentFeedbackPage = () => (
  <div className="container mx-auto mt-5 main-content">
    <h1>Feedback</h1>
    <FeedbackForm userType="talent" />
    <FeedbackList userType="talent" />
  </div>
);

export default TalentFeedbackPage;
