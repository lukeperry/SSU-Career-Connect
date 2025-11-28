import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import '../css/Profile.css';
import { WithContext as ReactTags } from 'react-tag-input';
import { predefinedSkills } from '../components/skillsList';


// Location data for Samar provinces
const locationData = {
  'Samar (Western Samar)': ['Almagro', 'Basey', 'Calbayog City', 'Calbiga', 'Catbalogan City', 'Daram', 'Gandara', 'Hinabangan', 'Jiabong', 'Marabut', 'Matuguinao', 'Motiong', 'Pagsanghan', 'Paranas (Wright)', 'Pinabacdao', 'San Jorge', 'San Jose de Buan', 'San Sebastian', 'Santa Margarita', 'Santa Rita', 'Santo Niño', 'Tarangnan', 'Talalora', 'Tarangan', 'Villareal', 'Zumarraga'],
  'Northern Samar': ['Allen', 'Biri', 'Bobon', 'Capul', 'Catarman', 'Catubig', 'Gamay', 'Laoang', 'Lapinig', 'Las Navas', 'Lavezares', 'Lope de Vega', 'Mapanas', 'Mondragon', 'Palapag', 'Pambujan', 'Rosario', 'San Antonio', 'San Isidro', 'San Jose', 'San Roque', 'San Vicente', 'Silvino Lobos', 'Victoria'],
  'Eastern Samar': ['Arteche', 'Balangiga', 'Balangkayan', 'Borongan City', 'Can-avid', 'Dolores', 'General MacArthur', 'Giporlos', 'Guiuan', 'Hernani', 'Jipapad', 'Lawaan', 'Llorente', 'Maslog', 'Maydolong', 'Mercedes', 'Oras', 'Quinapondan', 'Salcedo', 'San Julian', 'San Policarpo', 'Sulat', 'Taft']
};

const barangayData = {
  'Catbalogan City': [
    'Albalate', 'Bagongon', 'Bangon', 'Basiao', 'Buluan', 'Bunuanan',
    'Cabugawan', 'Cagudalo', 'Cagusipan', 'Cagutian', 'Cagutsan', 
    'Canhawan Guti', 'Canlapwas (Poblacion 15)', 'Cawayan', 'Cinco',
    'Darahuway Daco', 'Darahuway Guti', 'Estaka', 'Guindapunan', 
    'Guinsorongan', 'Ibol', 'Iguid', 'Lagundi', 'Libas', 'Lobo',
    'Manguehay', 'Maulong (Oraa)', 'Mercedes', 'Mombon', 
    'New Mahayag (Anayan)', 'Old Mahayag', 'Palanyogon', 'Pangdan', 'Payao',
    'Poblacion 1 (Barangay 1)', 'Poblacion 2 (Barangay 2)', 
    'Poblacion 3 (Barangay 3)', 'Poblacion 4 (Barangay 4)', 
    'Poblacion 5 (Barangay 5)', 'Poblacion 6 (Barangay 6)', 
    'Poblacion 7 (Barangay 7)', 'Poblacion 8 (Barangay 8)',
    'Poblacion 9 (Barangay 9)', 'Poblacion 10 (Barangay 10: Monsanto Street)',
    'Poblacion 11 (Barangay 11)', 'Poblacion 12 (Barangay 12)',
    'Poblacion 13 (Barangay 13)', 'Muñoz (Poblacion 14)',
    'Pupua', 'Rama', 'San Andres', 'San Pablo', 'San Roque', 
    'San Vicente', 'Silanga (Papaya)', 'Socorro', 'Totoringon'
  ],
  'Calbayog City': ['Aguit-itan', 'Amampacang', 'Awang', 'Bagacay', 'Balud', 'Basud', 'Buenavista', 'Cag-Anahaw', 'Caglanipao', 'Cagsalaosao', 'Capoocan', 'Danao', 'Dinagan', 'Gadgaran', 'Hamorawon', 'Hibatang', 'Hindang', 'Lonoy', 'Malaga', 'Matobato', 'Mancol', 'Nuntanga', 'Obrero', 'Oquendo', 'Pagbalican', 'Pagsulhugon', 'Peña', 'Rawis', 'Rizal', 'Roxas', 'San Joaquin', 'San Policarpo', 'Tinambacan', 'Tomaligues'],
  'Catarman': ['Acacia', 'Airport Village', 'Baybay', 'Bocsol', 'Calachuchi', 'Cal-igang', 'Cawayan', 'Cervantes', 'Dalakit', 'Doña Pulqueria', 'Galutan', 'Gebalagnan', 'Gebulwangan', 'Guba', 'Hibabngan', 'Huyon-huyon', 'Imelda', 'Jose Abad Santos', 'Kasoy', 'Lag-on', 'Lapu-lapu', 'Libtong', 'Libjo', 'McKinley', 'Molave', 'Narra', 'New Rizal', 'Paticua', 'Polangi', 'Quezon', 'Talisay', 'Washington'],
  'Borongan City': ['Alang-alang', 'Amantacop', 'Ando', 'Balud', 'Banuyo', 'Bato', 'Baybay', 'Benowangan', 'Bugas', 'Cabong', 'Calingatngan', 'Calzada', 'Canjaway', 'Canmarating', 'Can-opo', 'Divinubo', 'Don Paulino Navarro', 'Guardia', 'Hindang', 'Lalawigan', 'Libuton', 'Locso-on', 'Maybacong', 'Maypangdan', 'Punta Maria', 'Sabang North', 'Sabang South', 'San Jose', 'San Pablo', 'Santa Fe', 'Siha', 'Songco', 'Suribao', 'Surok', 'Tabunan', 'Talisay', 'Tayud', 'Trinidad'],
  'Basey': ['Amandayehan', 'Bacubac', 'Baloog', 'Basiao', 'Burgos', 'Cambayan', 'Can-aponte', 'Cancatac', 'Cogon', 'Guin-on', 'Guintigui-an', 'Inapulangan', 'Inuboran', 'Loog', 'Mancol', 'Manlilinab', 'Mongabong', 'Old Poblacion', 'Palaypay', 'Panugmonon', 'San Antonio', 'San Fernando', 'Serum', 'Suludnon', 'Sulod', 'Tiguib', 'Tingib', 'Villa Aurora', 'Cubay']
};

// Helper functions for location dropdowns
const getCitiesByProvince = (province) => {
  return locationData[province] || [];
};

const getBarangaysByCity = (city) => {
  // Return barangays for cities that have data, otherwise return default barangays
  return barangayData[city] || ['Poblacion', 'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
};

const TalentProfile = () => {
  const { id } = useParams(); // Get the talent ID from the URL
  const [talentDetails, setTalentDetails] = useState({
    skills: [],
    resumeUrl: "" // Add resumeUrl to the initial state
  });
  const [, setProfilePicture] = useState(null); // Store original file for compression
  const [preview, setPreview] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState(""); // State to store the user's role
  const [messageContent, setMessageContent] = useState(""); // State to store the message content
  const [messageModalIsOpen, setMessageModalIsOpen] = useState(false); // State to control the message modal
  const [resumeFile, setResumeFile] = useState(null); // State to store the resume file (for upload)
  const [documents, setDocuments] = useState([]); // State to store multiple documents
  const [loggedInUserId] = useState(localStorage.getItem("userId")); // State to store the logged-in user's ID
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [companyList, setCompanyList] = useState([]); // State to store company names for autocomplete

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const url = id 
          ? `${process.env.REACT_APP_API_ADDRESS}/api/talent/profile/${id}` 
          : `${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        data.skills = data.skills || [];
        data.documents = data.documents || [];
        
        // Parse location if individual fields are not set but location exists
        if (data.location && (!data.province || !data.city || !data.barangay)) {
          const parts = data.location.split(',').map(part => part.trim());
          if (parts.length === 3) {
            data.barangay = parts[0];
            data.city = parts[1];
            data.province = parts[2];
          }
        }
        
        setTalentDetails(data);
        setDocuments(data.documents || []);
        setRole(localStorage.getItem("role")); // Get the user's role from localStorage
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [id]);

  // Fetch company names for autocomplete
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/hr/companies`);
        setCompanyList(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

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
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/talent/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile picture updated successfully!");
      setTalentDetails({ ...talentDetails, profilePicture: response.data.profilePicture });
      setModalIsOpen(false);
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error uploading picture:", error);
      setMessage("Failed to upload profile picture.");
      setModalIsOpen(false);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        e.target.value = ''; // Clear the input
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      setResumeFile(file);
      setMessage(''); // Clear any previous messages
      setError(''); // Clear any previous errors
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError("Please select a document to upload.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("filename", resumeFile.name);

    try {
      setMessage("Uploading document...");
      setError("");
      
      const response = await axios.post(`${process.env.REACT_APP_API_ADDRESS}/api/talent/upload-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update documents list
      const newDocuments = response.data.documents || [];
      setDocuments(newDocuments);
      setTalentDetails({ ...talentDetails, documents: newDocuments });
      setMessage("Document uploaded successfully!");
      setResumeFile(null); // Clear the file input
      // Clear the file input element
      const fileInput = document.querySelector('input[type="file"][name="resume"]');
      if (fileInput) fileInput.value = '';
      
      // Scroll to top to show success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
      }, 100);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.response?.data?.message || 'Error uploading document. Please try again.');
      setMessage("");
      // Scroll to top to show error message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
      }, 100);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setMessage("Deleting document...");
      setError("");
      
      const response = await axios.delete(`${process.env.REACT_APP_API_ADDRESS}/api/talent/delete-document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update documents list
      const newDocuments = response.data.documents || [];
      setDocuments(newDocuments);
      setTalentDetails({ ...talentDetails, documents: newDocuments });
      setMessage("Document deleted successfully!");
      
      // Scroll to top to show success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
      }, 100);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error.response?.data?.message || 'Error deleting document. Please try again.');
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // Auto-generate location field from province, city, and barangay
    const updatedDetails = { ...talentDetails };
    if (updatedDetails.province && updatedDetails.city && updatedDetails.barangay) {
      updatedDetails.location = `${updatedDetails.barangay}, ${updatedDetails.city}, ${updatedDetails.province}`;
    }
    
    try {
      await axios.put(`${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`, updatedDetails, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTalentDetails(updatedDetails); // Update local state with the generated location
      setMessage("Profile updated successfully!");
      setIsEditMode(false); // Exit edit mode after successful save
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to update profile.");
      }
      console.error("Error updating profile:", error);
    }
  };

  const handleSendMessage = async () => {
  // senderId is not needed here
    const receiverId = id; // Talent ID from the URL
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ADDRESS}/api/messages`,
        {
          receiverId,
          content: messageContent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setMessageContent("");
        setMessageModalIsOpen(false);
        toast.success("Message sent successfully!");
      } else {
        toast.error("Failed to send message: Unknown error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
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
      
      <div className="profile-picture-container-profile">
        {talentDetails.profilePicture ? (
          <img
            src={talentDetails.profilePicture}
            alt="Profile"
            className="profile-picture"
            onError={(e) => {
              console.error('Failed to load profile picture:', talentDetails.profilePicture);
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
            display: talentDetails.profilePicture ? 'none' : 'flex'
          }}
        >
          {talentDetails.firstName?.charAt(0) || ''}{talentDetails.lastName?.charAt(0) || ''}
        </div>
        <p className="profile-name">{talentDetails.username}</p>
        {role !== 'hr' && (!id || loggedInUserId === id) && (
          <label className="update-picture-label">
            Update Picture
            <input type="file" onChange={handlePictureChange} style={{ display: 'none' }} />
          </label>
        )}
        {role === 'hr' && (
          <button onClick={() => setMessageModalIsOpen(true)} className="btn btn-primary">
            Send Message
          </button>
        )}
      </div>
      
      {/* Profile Completion - Below profile picture */}
      {(!id || loggedInUserId === id) && talentDetails.profileCompletionPercentage !== undefined && (
        <div className="profile-completion-container" style={{ 
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
          padding: '20px', 
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong style={{ fontSize: '1rem', color: '#333' }}>Profile Completion</strong>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: talentDetails.profileCompletionPercentage === 100 ? '#4CAF50' : '#667eea'
            }}>
              {talentDetails.profileCompletionPercentage}%
            </span>
          </div>
          <div style={{ width: '100%', background: '#e0e0e0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${talentDetails.profileCompletionPercentage}%`, 
                background: talentDetails.profileCompletionPercentage === 100 
                  ? 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)'
                  : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                borderRadius: '10px',
                transition: 'width 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            ></div>
          </div>
          {talentDetails.profileCompletionPercentage < 100 && (
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666', marginBottom: 0 }}>
              💡 Complete your profile to get better job matches!
            </p>
          )}
          {talentDetails.profileCompletionPercentage === 100 && (
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#4CAF50', marginBottom: 0 }}>
              ✅ Your profile is complete!
            </p>
          )}
        </div>
      )}
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
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.username || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, username: e.target.value })}
              className="form-control"
            />
          ) : (
            <p>{talentDetails.username}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>First Name:</strong>
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.firstName || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, firstName: e.target.value })}
              className="form-control"
            />
          ) : (
            <p>{talentDetails.firstName}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Last Name:</strong>
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.lastName || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, lastName: e.target.value })}
              className="form-control"
            />
          ) : (
            <p>{talentDetails.lastName}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Birthday:</strong>
          {isEditMode ? (
            <input
              type="date"
              value={talentDetails.birthday ? new Date(talentDetails.birthday).toISOString().split('T')[0] : ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, birthday: e.target.value })}
              className="form-control"
            />
          ) : (
            <p>{talentDetails.birthday ? new Date(talentDetails.birthday).toLocaleDateString() : 'N/A'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Gender:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.gender || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, gender: e.target.value })}
              className="form-control"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          ) : (
            <p>{talentDetails.gender || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Age:</strong>
          <p>{talentDetails.age ? `${talentDetails.age} years old` : 'Not specified'}</p>
        </div>
        <div className="profile-box">
          <strong>Civil Status:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.civilStatus || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, civilStatus: e.target.value })}
              className="form-control"
            >
              <option value="">Select...</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          ) : (
            <p>{talentDetails.civilStatus || 'Not specified'}</p>
          )}
        </div>

        <h2 className="profile-section-header">Contact Information</h2>
        <div className="profile-box">
          <strong>Email:</strong>
          {isEditMode ? (
            <input
              type="email"
              value={talentDetails.email || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, email: e.target.value })}
              className="form-control"
            />
          ) : (
            <p>{talentDetails.email}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Phone Number:</strong>
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.phoneNumber || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, phoneNumber: e.target.value })}
              placeholder="+63 912 345 6789"
              className="form-control"
            />
          ) : (
            <p>{talentDetails.phoneNumber}</p>
          )}
        </div>
        {/* Location - Cascading Dropdowns */}
        <div className="profile-box">
          <strong>Province:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.province || ''}
              onChange={(e) => {
                const newProvince = e.target.value;
                setTalentDetails({ 
                  ...talentDetails, 
                  province: newProvince,
                  city: '', // Reset city when province changes
                  barangay: '', // Reset barangay when province changes
                  location: '' // Will be auto-generated on save
                });
              }}
              className="form-control"
            >
              <option value="">Select Province...</option>
              <option value="Samar (Western Samar)">Samar (Western Samar)</option>
              <option value="Northern Samar">Northern Samar</option>
              <option value="Eastern Samar">Eastern Samar</option>
            </select>
          ) : (
            <p>{talentDetails.province || 'Not specified'}</p>
          )}
        </div>

        <div className="profile-box">
          <strong>City/Municipality:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.city || ''}
              onChange={(e) => {
                const newCity = e.target.value;
                setTalentDetails({ 
                  ...talentDetails, 
                  city: newCity,
                  barangay: '', // Reset barangay when city changes
                  location: '' // Will be auto-generated on save
                });
              }}
              className="form-control"
              disabled={!talentDetails.province}
            >
              <option value="">Select City/Municipality...</option>
              {talentDetails.province && getCitiesByProvince(talentDetails.province).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          ) : (
            <p>{talentDetails.city || 'Not specified'}</p>
          )}
        </div>

        <div className="profile-box">
          <strong>Barangay:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.barangay || ''}
              onChange={(e) => {
                const newBarangay = e.target.value;
                setTalentDetails({ 
                  ...talentDetails, 
                  barangay: newBarangay,
                  location: '' // Will be auto-generated on save
                });
              }}
              className="form-control"
              disabled={!talentDetails.city}
            >
              <option value="">Select Barangay...</option>
              {talentDetails.city && getBarangaysByCity(talentDetails.city).map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          ) : (
            <p>{talentDetails.barangay || 'Not specified'}</p>
          )}
        </div>

        <div className="profile-box">
          <strong>Full Address:</strong>
          <p className="text-muted">
            {talentDetails.barangay && talentDetails.city && talentDetails.province 
              ? `${talentDetails.barangay}, ${talentDetails.city}, ${talentDetails.province}`
              : talentDetails.location || 'Not specified'
            }
          </p>
        </div>

        <h2 className="profile-section-header">Education Background</h2>
        <div className="profile-box">
          <strong>Education Level:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.educationLevel || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, educationLevel: e.target.value })}
              className="form-control"
            >
              <option value="">Select...</option>
              <option value="High School">High School</option>
              <option value="Vocational">Vocational</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          ) : (
            <p>{talentDetails.educationLevel || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>School/University:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.school || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, school: e.target.value })}
              className="form-control"
            >
              <option value="">Select School/University...</option>
              <option value="Samar State University">Samar State University</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p>{talentDetails.school || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Degree/Program:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.degree || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, degree: e.target.value })}
              className="form-control"
            >
              <option value="">Select Program...</option>
              
              {/* College of Graduate Studies */}
              <optgroup label="College of Graduate Studies">
                <option value="PhD in Educational Management">PhD in Educational Management</option>
                <option value="PhD in Technology Management">PhD in Technology Management (PhDTM)</option>
                <option value="Doctor of Management">Doctor of Management (DM)</option>
                <option value="Master of Arts">Master of Arts (MA)</option>
                <option value="Master of Arts in Teaching">Master of Arts in Teaching (MAT)</option>
                <option value="Master of Arts in Education">Master of Arts in Education (MAEd)</option>
                <option value="Master of Arts in Elementary Education">Master of Arts in Elementary Education (MAEEd)</option>
                <option value="Master in Technician Education">Master in Technician Education (MTE)</option>
                <option value="Master in Public Management">Master in Public Management (MPM)</option>
                <option value="Master of Engineering - Water Resources Engineering and Management">MEng'g - Water Resources Engineering and Management (WREM)</option>
                <option value="Master of Engineering - Construction Engineering and Management">MEng'g - Construction Engineering and Management (CEM)</option>
                <option value="Master of Engineering - Civil Engineering">MEng'g - Civil Engineering (CE)</option>
                <option value="Master of Engineering - Environmental Engineering">MEng'g - Environmental Engineering (EnE)</option>
                <option value="Master of Engineering - Engineering Management">MEng'g - Engineering Management (EM)</option>
              </optgroup>
              
              {/* College of Engineering */}
              <optgroup label="College of Engineering">
                <option value="Bachelor of Science in Civil Engineering">BS Civil Engineering</option>
                <option value="Bachelor of Science in Computer Engineering">BS Computer Engineering</option>
                <option value="Bachelor of Science in Electrical Engineering">BS Electrical Engineering</option>
                <option value="Bachelor of Science in Electronics Engineering">BS Electronics Engineering</option>
              </optgroup>
              
              {/* College of Nursing and Health Sciences */}
              <optgroup label="College of Nursing and Health Sciences">
                <option value="Bachelor of Science in Nursing">BS Nursing</option>
                <option value="Bachelor of Science in Pharmacy">BS Pharmacy</option>
                <option value="Bachelor of Science in Nutrition and Dietetics">BS Nutrition and Dietetics</option>
              </optgroup>
              
              {/* College of Education */}
              <optgroup label="College of Education">
                <option value="Bachelor in Elementary Education">Bachelor in Elementary Education</option>
                <option value="Bachelor in Secondary Education - General Science">BSEd - General Science</option>
                <option value="Bachelor in Secondary Education - English">BSEd - English</option>
                <option value="Bachelor in Secondary Education - Math">BSEd - Math</option>
                <option value="Bachelor in Secondary Education - Physical Education">BSEd - Physical Education (PE)</option>
                <option value="Bachelor in Secondary Education - Social Studies">BSEd - Social Studies</option>
                <option value="Bachelor of Science in Industrial Education">BS Industrial Education</option>
                <option value="Bachelor of Science in Technician Education">BS Technician Education</option>
              </optgroup>
              
              {/* College of Arts and Sciences */}
              <optgroup label="College of Arts and Sciences">
                <option value="Bachelor of Science in Applied Statistics">BS Applied Statistics</option>
                <option value="Bachelor of Science in Information Technology">BS Information Technology</option>
                <option value="Bachelor of Science in Information System">BS Information System</option>
                <option value="Bachelor of Science in Psychology">BS Psychology</option>
              </optgroup>
              
              {/* College of Industrial Technology and Architecture */}
              <optgroup label="College of Industrial Technology and Architecture">
                <option value="Bachelor of Science in Architecture">BS Architecture</option>
                <option value="Bachelor of Science in Industrial Technology">BS Industrial Technology</option>
                <option value="Bachelor of Technology">Bachelor of Technology</option>
                <option value="Competency-Based Vocational Education">Competency-Based Vocational Education</option>
              </optgroup>
              
              {/* College of Fisheries and Marine Sciences */}
              <optgroup label="College of Fisheries and Marine Sciences">
                <option value="Master of Science in Fisheries Education">Master of Science in Fisheries Education</option>
                <option value="Bachelor of Science in Marine Engineering">BS Marine Engineering</option>
                <option value="Bachelor of Science in Fisheries">BS Fisheries</option>
                <option value="Bachelor of Secondary Education - Fisheries Education">BSEd - Fisheries Education</option>
                <option value="Bachelor of Science in Marine Biology">BS Marine Biology</option>
              </optgroup>
              
              {/* Other/Not Listed */}
              <option value="Other">Other (Not Listed)</option>
            </select>
          ) : (
            <p>{talentDetails.degree || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>College:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.college || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, college: e.target.value })}
              className="form-control"
            >
              <option value="">Select College...</option>
              <option value="College of Graduate Studies">College of Graduate Studies</option>
              <option value="College of Nursing and Health Sciences">College of Nursing and Health Sciences</option>
              <option value="College of Engineering">College of Engineering</option>
              <option value="College of Education">College of Education</option>
              <option value="College of Arts and Sciences">College of Arts and Sciences</option>
              <option value="College of Industrial Technology">College of Industrial Technology</option>
              <option value="College of Fisheries and Marine Aquatic Sciences">College of Fisheries and Marine Aquatic Sciences</option>
            </select>
          ) : (
            <p>{talentDetails.college || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Major/Specialization:</strong>
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.major || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, major: e.target.value })}
              placeholder="e.g., Software Engineering"
              className="form-control"
            />
          ) : (
            <p>{talentDetails.major || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Graduation Year:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.graduationYear || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, graduationYear: parseInt(e.target.value) || '' })}
              className="form-control"
            >
              <option value="">Select Year...</option>
              {Array.from({ length: 31 }, (_, i) => 2030 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          ) : (
            <p>{talentDetails.graduationYear || 'Not specified'}</p>
          )}
        </div>

        <h2 className="profile-section-header">Employment Information</h2>
        <div className="profile-box">
          <strong>Employment Status:</strong>
          {isEditMode ? (
            <select
              value={talentDetails.employmentStatus || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, employmentStatus: e.target.value })}
              className="form-control"
            >
              <option value="">Select...</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Underemployed">Underemployed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Student">Student</option>
              <option value="Retired">Retired</option>
            </select>
          ) : (
            <p>{talentDetails.employmentStatus || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Current Company:</strong>
          {isEditMode ? (
            <>
              <input
                type="text"
                list="company-suggestions"
                value={talentDetails.currentCompany || ''}
                onChange={(e) => setTalentDetails({ ...talentDetails, currentCompany: e.target.value })}
                placeholder="e.g., Accenture Philippines or None"
                className="form-control"
              />
              <datalist id="company-suggestions">
                <option value="None" />
                {companyList.map((company, index) => (
                  <option key={index} value={company} />
                ))}
              </datalist>
            </>
          ) : (
            <p>{talentDetails.currentCompany || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Current Position:</strong>
          {isEditMode ? (
            <input
              type="text"
              value={talentDetails.currentPosition || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, currentPosition: e.target.value })}
              placeholder="e.g., Software Engineer"
              className="form-control"
            />
          ) : (
            <p>{talentDetails.currentPosition || 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Years of Experience:</strong>
          {isEditMode ? (
            <input
              type="number"
              value={talentDetails.yearsOfExperience || 0}
              onChange={(e) => setTalentDetails({ ...talentDetails, yearsOfExperience: parseInt(e.target.value) || 0 })}
              min="0"
              max="50"
              className="form-control"
            />
          ) : (
            <p>{talentDetails.yearsOfExperience !== undefined ? `${talentDetails.yearsOfExperience} years` : 'Not specified'}</p>
          )}
        </div>
        <div className="profile-box">
          <strong>Expected Salary:</strong>
          {isEditMode ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                value={talentDetails.expectedSalary?.min || ''}
                onChange={(e) => setTalentDetails({ 
                  ...talentDetails, 
                  expectedSalary: { 
                    ...talentDetails.expectedSalary, 
                    min: parseInt(e.target.value) || 0,
                    currency: 'PHP'
                  } 
                })}
                placeholder="Min (e.g., 25000)"
                min="0"
                className="form-control"
                style={{ flex: 1 }}
              />
              <span>to</span>
              <input
                type="number"
                value={talentDetails.expectedSalary?.max || ''}
                onChange={(e) => setTalentDetails({ 
                  ...talentDetails, 
                  expectedSalary: { 
                    ...talentDetails.expectedSalary, 
                    max: parseInt(e.target.value) || 0,
                    currency: 'PHP'
                  } 
                })}
                placeholder="Max (e.g., 35000)"
                min="0"
                className="form-control"
                style={{ flex: 1 }}
              />
            </div>
          ) : (
            <p>
              {talentDetails.expectedSalary?.min && talentDetails.expectedSalary?.max 
                ? `${talentDetails.expectedSalary.currency || 'PHP'} ${talentDetails.expectedSalary.min.toLocaleString()} - ${talentDetails.expectedSalary.max.toLocaleString()}`
                : 'Not specified'}
            </p>
          )}
        </div>

        <h2 className="profile-section-header">Professional Information</h2>
        <div className="profile-box full-width">
          <strong>Experience:</strong>
          {isEditMode ? (
            <textarea
              value={talentDetails.experience || ''}
              onChange={(e) => setTalentDetails({ ...talentDetails, experience: e.target.value })}
              placeholder="Describe your work experience, projects, and achievements..."
              rows="4"
              className="form-control"
              style={{ width: '100%', minHeight: '100px' }}
            />
          ) : (
            <p>{talentDetails.experience || 'No experience details provided'}</p>
          )}
        </div>
        <div className="profile-box half-width">
          <strong>Skills:</strong>
          {isEditMode && (!id || loggedInUserId === id) ? (
            <ReactTags
              tags={(talentDetails.skills || []).map((skill) => ({ id: skill, text: skill }))}
              suggestions={(predefinedSkills || []).map((skill) => ({ id: skill, text: skill }))}
              handleDelete={(index) => {
                const newSkills = [...(talentDetails.skills || [])];
                newSkills.splice(index, 1);
                setTalentDetails({ ...talentDetails, skills: newSkills });
              }}
              handleAddition={(newTag) => {
                setTalentDetails({ ...talentDetails, skills: [...(talentDetails.skills || []), newTag.text] });
              }}
              inputFieldPosition="bottom"
              autocomplete
              autofocus={false}
            />
          ) : (
            <div className="skills-display">
              {(talentDetails.skills || []).length > 0 ? (
                <div className="tags-container">
                  {(talentDetails.skills || []).map((skill, index) => (
                    <span key={index} className="tag-readonly">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No skills listed</p>
              )}
            </div>
          )}
        </div>
        <div className="profile-box half-width">
          <strong>Documents:</strong>
          {(!id || loggedInUserId === id) && (
            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
              <input 
                type="file" 
                name="resume"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleResumeChange}
                style={{ marginBottom: '10px' }}
              />
              <button 
                onClick={handleResumeUpload} 
                className="btn btn-primary"
                disabled={!resumeFile}
                style={{ marginLeft: '10px' }}
              >
                {resumeFile ? 'Upload Document' : 'Select a file first'}
              </button>
            </div>
          )}
          
          {/* Display uploaded documents */}
          {documents && documents.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documents.map((doc, index) => (
                  <div 
                    key={doc._id || index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#f9f9f9',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                      }}
                    >
                      📄 {doc.filename || `Document ${index + 1}`}
                    </a>
                    {(!id || loggedInUserId === id) && (
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#cc0000'}
                        onMouseLeave={(e) => e.target.style.background = '#ff4444'}
                      >
                        ✕ Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legacy resume URL support */}
          {talentDetails.resumeUrl && (!documents || documents.length === 0) && (
            <p style={{ marginTop: '10px' }}>
              <a 
                href={talentDetails.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}
              >
                📄 View Resume (Legacy)
              </a>
            </p>
          )}
          
          {(!documents || documents.length === 0) && !talentDetails.resumeUrl && (
            <p style={{ marginTop: '10px', color: '#999', fontSize: '0.9rem' }}>
              No documents uploaded yet.
            </p>
          )}
        </div>
      </div>
      {role !== 'hr' && (!id || loggedInUserId === id) && !isEditMode && (
        <button onClick={() => setIsEditMode(true)} className="btn btn-primary" style={{ marginTop: '20px' }}>
          ✏️ Edit Profile
        </button>
      )}
      {role !== 'hr' && (!id || loggedInUserId === id) && isEditMode && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={handleSubmit} className="btn btn-primary">
            ✅ Save Changes
          </button>
          <button 
            onClick={() => {
              setIsEditMode(false);
              // Refresh profile to discard changes
              const fetchProfile = async () => {
                const token = localStorage.getItem("token");
                try {
                  const url = id 
                    ? `${process.env.REACT_APP_API_ADDRESS}/api/talent/profile/${id}` 
                    : `${process.env.REACT_APP_API_ADDRESS}/api/talent/profile`;
                  const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const data = response.data;
                  data.skills = data.skills || [];
                  setTalentDetails(data);
                } catch (error) {
                  console.error("Error fetching profile:", error);
                }
              };
              fetchProfile();
            }} 
            className="btn"
            style={{ background: '#6c757d', color: 'white' }}
          >
            ❌ Cancel
          </button>
        </div>
      )}
      <Modal
        isOpen={messageModalIsOpen}
        onRequestClose={() => setMessageModalIsOpen(false)}
        contentLabel="Send Message"
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
        <h2 className="profile-title">Send Message</h2>
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message here..."
          rows="4"
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button onClick={handleSendMessage} className="btn btn-primary">Send Message</button>
        <button onClick={() => setMessageModalIsOpen(false)}>Cancel</button>
      </Modal>
    </div>
  );
};

export default TalentProfile;

