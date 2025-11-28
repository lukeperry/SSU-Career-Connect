import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../css/ApplicantsList.css'; // Import the CSS file for styling

const ApplicantsList = () => {
  const { jobId } = useParams(); // Get the job ID from the URL
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/application/job/${jobId}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Applicants response:', response.data);
        console.log('First applicant profile picture:', response.data.applications[0]?.talentId?.profilePicture);
        setApplicants(response.data.applications);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('Failed to load applicants.');
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicantId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_ADDRESS}/api/application/${applicantId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplicants(applicants.map(applicant => 
        applicant._id === applicantId ? { ...applicant, status } : applicant
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="applicants-list">
        <h2><Skeleton width={200} /></h2>
        <div className="applicants-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="applicant-card">
              <Skeleton circle height={80} width={80} />
              <Skeleton height={24} width={150} style={{ marginTop: '10px' }} />
              <Skeleton height={16} width={120} />
              <Skeleton height={16} count={2} />
              <Skeleton height={40} style={{ marginTop: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="applicants-container">
      <h2 className="applicants-header">Applicants for This Position</h2>
      {applicants.length === 0 ? (
        <div className="no-applicants">
          <p>No applicants yet for this position.</p>
        </div>
      ) : (
        <div className="applicants-list">
          {applicants.map((applicant) => {
            console.log('Rendering applicant:', applicant.talentId.firstName, applicant.talentId.lastName);
            console.log('Profile picture URL:', applicant.talentId.profilePicture);
            
            const profilePictureUrl = applicant.talentId.profilePicture;
            const initials = getInitials(applicant.talentId.firstName, applicant.talentId.lastName);
            
            return (
              <div key={applicant._id} className="applicant-card-modern">
                <div className="applicant-card-header">
                  <div className="profile-picture-wrapper">
                    {profilePictureUrl ? (
                      <>
                        <img
                          src={profilePictureUrl}
                          alt={`${applicant.talentId.firstName} ${applicant.talentId.lastName}`}
                          className="applicant-profile-pic"
                          onError={(e) => {
                            console.error('❌ Failed to load profile picture:', profilePictureUrl);
                            console.error('Image error event:', e);
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                          onLoad={(e) => {
                            console.log('✅ Profile picture loaded successfully:', profilePictureUrl);
                          }}
                        />
                        <div className="applicant-profile-fallback" style={{ display: 'none' }}>
                          {initials}
                        </div>
                      </>
                    ) : (
                      <div className="applicant-profile-fallback">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="applicant-name-section">
                    <h3 className="applicant-full-name">
                      {applicant.talentId.firstName} {applicant.talentId.lastName}
                    </h3>
                    <div className="applicant-match-score">
                      <span className="score-badge">{Math.round(applicant.matchScore * 100)}% Match</span>
                    </div>
                  </div>
                </div>

                <div className="applicant-card-body">
                  <div className="applicant-info-row">
                    <span className="info-label">📧 Email:</span>
                    <span className="info-value">{applicant.talentId.email}</span>
                  </div>
                  <div className="applicant-info-row">
                    <span className="info-label">📅 Applied:</span>
                    <span className="info-value">{new Date(applicant.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="applicant-info-row">
                    <span className="info-label">📊 Status:</span>
                    <span className={`status-badge status-${applicant.status}`}>
                      {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="applicant-card-actions">
                  <Link 
                    to={`/hr/talent-profile/${applicant.talentId._id}`} 
                    className="btn-view-profile"
                  >
                    View Full Profile
                  </Link>
                  <div className="status-actions">
                    <button 
                      onClick={() => handleStatusChange(applicant._id, 'accepted')} 
                      className="btn-accept"
                      disabled={applicant.status === 'accepted'}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleStatusChange(applicant._id, 'rejected')} 
                      className="btn-reject"
                      disabled={applicant.status === 'rejected'}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;