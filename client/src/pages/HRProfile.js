import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '../css/Profile.css';

const HRProfile = () => {
  const [hrDetails, setHrDetails] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    phoneNumber: '',
    profilePicture: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loggedInUserId] = useState(localStorage.getItem("userId")); // State to store the logged-in user's ID

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${process.env.REACT_APP_API_ADDRESS}/api/hr/profile`, hrDetails, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Profile updated successfully!");
      setEditModalIsOpen(false);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to update profile.");
      }
      console.error("Error updating profile:", error);
    }
  };

  const handleGenderChange = (e) => {
    setHrDetails({ ...hrDetails, gender: e.target.value });
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">HR Profile</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <p className="error">{error}</p>}
      <div className="profile-picture-container-profile">
        <img
          src={hrDetails.profilePicture}
          alt="Profile"
          className="profile-picture"
        />
        <p className="profile-name">{hrDetails.username}</p>
        {loggedInUserId === hrDetails._id && (
          <label className="update-picture-label">
            Update Picture
            <input type="file" onChange={handlePictureChange} style={{ display: 'none' }} />
          </label>
        )}
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
        {preview && <img src={preview} alt="Preview" className="profile-picture" />}
        <button onClick={handlePictureUpload}>Upload Picture</button>
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </Modal>
      <div className="profile-details">
        <div className="profile-box">
          <strong>Username:</strong>
          <p>{hrDetails.username}</p>
        </div>
        <div className="profile-box">
          <strong>First Name:</strong>
          <p>{hrDetails.firstName}</p>
        </div>
        <div className="profile-box">
          <strong>Last Name:</strong>
          <p>{hrDetails.lastName}</p>
        </div>
        <div className="profile-box">
          <strong>Birthday:</strong>
          <p>{hrDetails.birthday ? new Date(hrDetails.birthday).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="profile-box">
          <strong>Gender:</strong>
          <p>{hrDetails.gender}</p>
        </div>
        <div className="profile-box">
          <strong>Email:</strong>
          <p>{hrDetails.email}</p>
        </div>
        <div className="profile-box">
          <strong>Phone Number:</strong>
          <p>{hrDetails.phoneNumber}</p>
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
      {loggedInUserId === hrDetails._id && (
        <button onClick={() => setEditModalIsOpen(true)} className="btn btn-primary">Edit Profile</button>
      )}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={() => setEditModalIsOpen(false)}
        contentLabel="Edit Profile"
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
            maxHeight: '80vh', // Set maximum height
            overflowY: 'auto', // Enable vertical scrolling
          },
        }}
      >
        <h2 className="profile-title">Update Profile</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <p className="error">{error}</p>}
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Username: </label>
              <input
                type="text"
                name="username"
                value={hrDetails.username}
                onChange={(e) => setHrDetails({ ...hrDetails, username: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">First Name: </label>
              <input
                type="text"
                name="firstName"
                value={hrDetails.firstName}
                onChange={(e) => setHrDetails({ ...hrDetails, firstName: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Last Name: </label>
              <input
                type="text"
                name="lastName"
                value={hrDetails.lastName}
                onChange={(e) => setHrDetails({ ...hrDetails, lastName: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Birthday: </label>
              <input
                type="date"
                name="birthday"
                value={hrDetails.birthday ? new Date(hrDetails.birthday).toISOString().split('T')[0] : ''}
                onChange={(e) => setHrDetails({ ...hrDetails, birthday: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Gender: </label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="Male"
                    checked={hrDetails.gender === 'Male'}
                    onChange={handleGenderChange}
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    value="Female"
                    checked={hrDetails.gender === 'Female'}
                    onChange={handleGenderChange}
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    value="Other"
                    checked={hrDetails.gender === 'Other'}
                    onChange={handleGenderChange}
                  />
                  Other
                </label>
              </div>
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Email: </label>
              <input
                type="email"
                name="email"
                value={hrDetails.email}
                onChange={(e) => setHrDetails({ ...hrDetails, email: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Phone Number: </label>
              <input
                type="text"
                name="phoneNumber"
                value={hrDetails.phoneNumber}
                onChange={(e) => setHrDetails({ ...hrDetails, phoneNumber: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
};

export default HRProfile;
