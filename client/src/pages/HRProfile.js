import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from 'react-modal';
import '../css/Profile.css'; // Import the CSS file for styling

const HRProfile = () => {
  const [hrDetails, setHrDetails] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
          "Content-Type": "multipart/form-data"
        }
      });
      // Update the profile picture URL in the frontend state
      setHrDetails({ ...hrDetails, profilePicture: response.data.profilePicture });
      setModalIsOpen(false);
      setPreview(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  if (!hrDetails) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">HR Profile</h2>
      <div className="profile-picture-container">
        <img
          src={hrDetails.profilePicture} // Ensure the URL is correct
          alt="Profile"
          className="profile-picture"
        />
        <p className="profile-name">{hrDetails.username}</p>
      </div>
      <label className="update-picture-label">
        Update Picture
        <input type="file" onChange={handlePictureChange} style={{ display: 'none' }} />
      </label>
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
        {preview && <img src={preview} alt="Preview" className="preview-image" />}
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
