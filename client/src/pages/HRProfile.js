import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import '../css/Profile.css';

const HRProfile = () => {
  const { id } = useParams(); // Get the ID from URL params
  const [hrDetails, setHrDetails] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    phoneNumber: '',
    profilePicture: '',
  });
  const [, setProfilePicture] = useState(null); // Store original file for compression
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loggedInUserId] = useState(localStorage.getItem("userId")); // State to store the logged-in user's ID

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        let response;
        // If ID is provided in URL, fetch that user's profile (view mode)
        if (id) {
          response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/profile/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Otherwise, fetch logged-in user's own profile (edit mode)
          response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setHrDetails(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile.");
      }
    };
    fetchProfile();
  }, [id, loggedInUserId]);

  // Compress image before upload
  const compressImage = (file, maxSizeMB = 0.5) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (max 1024px)
          const maxDimension = 1024;
          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality adjustment
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
      };
    });
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress the image
      const compressedFile = await compressImage(file);
      console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      
      setProfilePicture(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setModalIsOpen(true);
    }
  };

  // Handle image dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch dragging
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setImagePosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Crop the image based on user's positioning and zoom
  const getCroppedImage = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = preview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const outputSize = 512; // Output size for profile picture (512x512)
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        const ctx = canvas.getContext('2d');
        
        // Calculate the source rectangle based on the crop circle
        const containerSize = 400; // Size of the preview container
        const circleRadius = containerSize * 0.4; // 80% width means 40% radius
        
        // Calculate the actual image dimensions in the preview
        const imgAspect = img.width / img.height;
        let displayWidth = containerSize;
        let displayHeight = containerSize;
        
        if (imgAspect > 1) {
          displayHeight = containerSize / imgAspect;
        } else {
          displayWidth = containerSize * imgAspect;
        }
        
        // Apply scale and position
        displayWidth *= imageScale;
        displayHeight *= imageScale;
        
        // Calculate center of the container
        const containerCenterX = containerSize / 2;
        const containerCenterY = containerSize / 2;
        
        // Image position in the container (with user's drag offset)
        const imgLeft = containerCenterX - displayWidth / 2 + imagePosition.x;
        const imgTop = containerCenterY - displayHeight / 2 + imagePosition.y;
        
        // Calculate the crop area (circular region)
        const cropLeft = containerCenterX - circleRadius;
        const cropTop = containerCenterY - circleRadius;
        const cropSize = circleRadius * 2;
        
        // Map the crop area from display coordinates to source image coordinates
        const scaleX = img.width / displayWidth;
        const scaleY = img.height / displayHeight;
        
        const sourceX = (cropLeft - imgLeft) * scaleX;
        const sourceY = (cropTop - imgTop) * scaleY;
        const sourceSize = cropSize * scaleX; // Use scaleX since we want square output
        
        // Draw the cropped and scaled image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // Source rectangle
          0, 0, outputSize, outputSize // Destination rectangle
        );
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.9 // 90% quality for the cropped image
        );
      };
    });
  };

  const handlePictureUpload = async () => {
    const token = localStorage.getItem("token");
    
    // Create the cropped image based on user's positioning
    const croppedImage = await getCroppedImage();
    console.log('Cropped image size:', (croppedImage.size / 1024).toFixed(2), 'KB');
    
    const formData = new FormData();
    formData.append("profilePicture", croppedImage);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/hr/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture updated successfully!");
      
      // Update the state with the new profile picture URL (includes SAS token)
      const newProfilePictureUrl = response.data.profilePicture;
      console.log('New profile picture URL:', newProfilePictureUrl);
      
      // Add cache-busting parameter to force reload
      const cacheBustedUrl = `${newProfilePictureUrl}&t=${Date.now()}`;
      setHrDetails({ ...hrDetails, profilePicture: cacheBustedUrl });
      
      setModalIsOpen(false);
      setPreview(null);
      setProfilePicture(null);
    } catch (error) {
      console.error("Error uploading picture:", error);
      setMessage("Failed to upload profile picture.");
      setModalIsOpen(false);
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
        {hrDetails.profilePicture ? (
          <img
            key={hrDetails.profilePicture}
            src={hrDetails.profilePicture}
            alt="Profile"
            className="profile-picture"
            onError={(e) => {
              console.error('Failed to load profile picture:', hrDetails.profilePicture);
              // Hide image and show initials fallback
              e.target.style.display = 'none';
              const initialsDiv = e.target.nextSibling;
              if (initialsDiv) {
                initialsDiv.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className="profile-picture-initials" 
          style={{ 
            display: hrDetails.profilePicture ? 'none' : 'flex'
          }}
        >
          {hrDetails.firstName?.charAt(0) || ''}{hrDetails.lastName?.charAt(0) || ''}
        </div>
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
        shouldCloseOnOverlayClick={false}
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
            overflow: 'visible',
          },
        }}
      >
        <div 
          className="image-preview-container"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {preview && (
            <img 
              src={preview} 
              alt="Preview"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'transform 0.1s ease',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              draggable={false}
            />
          )}
          <div className="crop-grid-overlay"></div>
          <div className="crop-guide-text">Drag to move • Scroll to zoom</div>
        </div>
        <div className="zoom-controls">
          <button 
            className="zoom-btn" 
            onClick={() => setImageScale(prev => Math.max(0.5, prev - 0.1))}
            aria-label="Zoom out"
          >
            ➖
          </button>
          <span className="zoom-level">{Math.round(imageScale * 100)}%</span>
          <button 
            className="zoom-btn" 
            onClick={() => setImageScale(prev => Math.min(3, prev + 0.1))}
            aria-label="Zoom in"
          >
            ➕
          </button>
          <button 
            className="zoom-btn reset-btn" 
            onClick={() => {
              setImageScale(1);
              setImagePosition({ x: 0, y: 0 });
            }}
            aria-label="Reset"
          >
            🔄 Reset
          </button>
        </div>
        <div className="modal-buttons">
          <button className="modal-upload-btn" onClick={handlePictureUpload}>
            📸 Upload Picture
          </button>
          <button className="modal-cancel-btn" onClick={() => setModalIsOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
      <div className="profile-details">
        <h2 className="profile-section-header">Personal Information</h2>
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

        <h2 className="profile-section-header">Contact Information</h2>
        <div className="profile-box">
          <strong>Email:</strong>
          <p>{hrDetails.email}</p>
        </div>
        <div className="profile-box">
          <strong>Phone Number:</strong>
          <p>{hrDetails.phoneNumber}</p>
        </div>

        <h2 className="profile-section-header">Company Information</h2>
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
