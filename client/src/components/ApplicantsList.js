import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
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

  if (loading) {
    return <p>Loading applicants...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="applicants-container">
      <h2 className="applicants-header">Applicants</h2>
      <div className="applicants-list">
        {applicants.map((applicant) => {
          console.log('Applicant:', applicant); // Log each applicant's details
          return (
            <div key={applicant._id} className="applicant-card" style={{ padding: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <img
                  src={applicant.talentId.profilePicture}
                  alt="Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <Link to={`/hr/talent-profile/${applicant.talentId._id}`} className="btn btn-link">View Profile</Link>
              </div>
              <div className="applicant-details">
                <p>Name: {applicant.talentId.firstName} {applicant.talentId.lastName}</p>
                <p>Email: {applicant.talentId.email}</p>
                <p style={{ fontWeight: 'bold', color: applicant.status === 'accepted' ? 'green' : applicant.status === 'rejected' ? 'red' : 'black' }}>
                  Status: {applicant.status}
                </p>
                <p>Score: {Math.round(applicant.matchScore * 100)}%</p> {/* Display the match score */}
                <p>Applied At: {new Date(applicant.appliedAt).toLocaleString()}</p>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => handleStatusChange(applicant._id, 'accepted')} className="btn btn-sm" style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}>Accept</button>
                  <button onClick={() => handleStatusChange(applicant._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicantsList;