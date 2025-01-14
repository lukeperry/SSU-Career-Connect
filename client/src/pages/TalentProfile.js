import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from 'react-modal';
import '../css/Profile.css'; // Import the CSS file for styling
import { WithContext as ReactTags } from 'react-tag-input'; // Import the ReactTags component
import { predefinedSkills } from '../components/skillsList'; // Import predefined skills

const TalentProfile = () => {
  const [talentDetails, setTalentDetails] = useState({
    skills: [] // Ensure skills is always an array
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        data.skills = data.skills || []; // Ensure skills is always an array
        setTalentDetails(data);
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
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/talent/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture updated successfully!");
      setTalentDetails({ ...talentDetails, profilePicture: response.data.profilePicture });
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
      await axios.put(`${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`, talentDetails, {
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

  if (!talentDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Talent Profile</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <p className="error">{error}</p>}
      <div className="profile-picture-container">
        <img
          src={talentDetails.profilePicture} // Ensure the URL is correct
          alt="Profile"
          className="profile-picture"
        />
        <p className="profile-name">{talentDetails.username}</p>
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
        <button onClick={handlePictureUpload} className="upload-button">Upload Picture</button>
        <button onClick={() => setModalIsOpen(false)} className="cancel-button">Cancel</button>
      </Modal>
      <div className="profile-details">
        <div className="profile-box">
          <strong>Username:</strong>
          <p>{talentDetails.username}</p>
        </div>
        <div className="profile-box">
          <strong>First Name:</strong>
          <p>{talentDetails.firstName}</p>
        </div>
        <div className="profile-box">
          <strong>Last Name:</strong>
          <p>{talentDetails.lastName}</p>
        </div>
        <div className="profile-box">
          <strong>Birthday:</strong>
          <p>{talentDetails.birthday ? new Date(talentDetails.birthday).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="profile-box">
          <strong>Gender:</strong>
          <p>{talentDetails.gender}</p>
        </div>
        <div className="profile-box">
          <strong>Email:</strong>
          <p>{talentDetails.email}</p>
        </div>
        <div className="profile-box">
          <strong>Phone Number:</strong>
          <p>{talentDetails.phoneNumber}</p>
        </div>
        <div className="profile-box">
          <strong>Location:</strong>
          <p>{talentDetails.location}</p>
        </div>
        <div className="profile-box">
          <strong>Experience:</strong>
          <p>{talentDetails.experience}</p>
        </div>
        <div className="profile-box">
          <strong>Skills:</strong>
          <ReactTags
            tags={talentDetails.skills ? talentDetails.skills.map((skill) => ({ id: skill, text: skill })) : []} // Map skills to tags
            suggestions={predefinedSkills.map((skill) => ({ id: skill, text: skill }))} // Use predefined suggestions
            handleDelete={(index) => {
              const newSkills = [...talentDetails.skills];
              newSkills.splice(index, 1); // Remove skill tag
              setTalentDetails({ ...talentDetails, skills: newSkills });
            }}
            handleAddition={(newTag) => {
              setTalentDetails({ ...talentDetails, skills: [...talentDetails.skills, newTag.text] }); // Add new skill
            }}
            inputFieldPosition="bottom" // Position of the input field
            autocomplete // Enable autocomplete for the input
          />
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => setEditModalIsOpen(true)}>
        Update Profile
      </button>
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
            height: 'auto',
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
                value={talentDetails.username}
                onChange={(e) => setTalentDetails({ ...talentDetails, username: e.target.value })}
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
                value={talentDetails.firstName}
                onChange={(e) => setTalentDetails({ ...talentDetails, firstName: e.target.value })}
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
                value={talentDetails.lastName}
                onChange={(e) => setTalentDetails({ ...talentDetails, lastName: e.target.value })}
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
                value={talentDetails.birthday ? new Date(talentDetails.birthday).toISOString().split('T')[0] : ''}
                onChange={(e) => setTalentDetails({ ...talentDetails, birthday: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Gender: </label>
              <select
                name="gender"
                value={talentDetails.gender}
                onChange={(e) => setTalentDetails({ ...talentDetails, gender: e.target.value })}
                required
                className="form-control"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Email: </label>
              <input
                type="email"
                name="email"
                value={talentDetails.email}
                onChange={(e) => setTalentDetails({ ...talentDetails, email: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Phone Number: </label>
              <input
                type="tel"
                name="phoneNumber"
                value={talentDetails.phoneNumber}
                onChange={(e) => setTalentDetails({ ...talentDetails, phoneNumber: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Location: </label>
              <input
                type="text"
                name="location"
                value={talentDetails.location}
                onChange={(e) => setTalentDetails({ ...talentDetails, location: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Experience: </label>
              <textarea
                name="experience"
                value={talentDetails.experience}
                onChange={(e) => setTalentDetails({ ...talentDetails, experience: e.target.value })}
                required
                className="form-control"
              />
            </div>
          </div>
          <div className="profile-box">
            <div className="form-group">
              <label className="bold-label">Skills: </label>
              <ReactTags
                tags={talentDetails.skills ? talentDetails.skills.map((skill) => ({ id: skill, text: skill })) : []} // Map skills to tags
                suggestions={predefinedSkills.map((skill) => ({ id: skill, text: skill }))} // Use predefined suggestions
                handleDelete={(index) => {
                  const newSkills = [...talentDetails.skills];
                  newSkills.splice(index, 1); // Remove skill tag
                  setTalentDetails({ ...talentDetails, skills: newSkills });
                }}
                handleAddition={(newTag) => {
                  setTalentDetails({ ...talentDetails, skills: [...talentDetails.skills, newTag.text] }); // Add new skill
                }}
                inputFieldPosition="bottom" // Position of the input field
                autocomplete // Enable autocomplete for the input
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditModalIsOpen(false)}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TalentProfile;
