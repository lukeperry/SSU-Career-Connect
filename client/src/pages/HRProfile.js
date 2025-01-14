import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const HRProfile = () => {
  const [hrDetails, setHrDetails] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHrDetails(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
      setModalIsOpen(true);
    }
  };

  const handlePictureUpload = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/hr/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture updated successfully!");
      setHrDetails({ ...hrDetails, profilePicture: response.data.profilePicture });
      setModalIsOpen(false);
    } catch (error) {
      console.error("Error uploading picture:", error);
      setMessage("Failed to upload profile picture.");
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">HR Profile</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <p className="error">{error}</p>}
      <div className="profile-picture-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={hrDetails.profilePicture}
          alt="Profile"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '10px'
          }}
        />
        <p className="profile-name" style={{ textAlign: 'center' }}>{hrDetails.username}</p>
        <label className="update-picture-label" style={{ textAlign: 'center' }}>
          Update Picture
          <input type="file" onChange={handlePictureChange} style={{ display: 'none' }} />
        </label>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Upload Image"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '600px',
            height: 'auto',
          },
        }}
      >
        {preview && <img src={preview} alt="Preview" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />}
        <button onClick={handlePictureUpload}>Upload Picture</button>
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </Modal>
      <div className="profile-details">
        <div className="profile-box">
          <strong>Username:</strong>
          <p>{hrDetails.username}</p>
        </div>
        <div className="profile-box">
          <strong>Email:</strong>
          <p>{hrDetails.email}</p>
        </div>
        <div className="profile-box">
          <strong>Company Name:</strong>
          <p>{hrDetails.companyName}</p>
        </div>
        <div className="profile-box">
          <strong>Account Created:</strong>
          <p>{new Date(hrDetails.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default HRProfile;
