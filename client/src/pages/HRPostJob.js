import React, { useState } from 'react'; // Removed useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/HRPostJob.css'; // Link to the CSS file for styling
import { WithContext as ReactTags } from 'react-tag-input'; // Import the ReactTags component
import { predefinedSkills } from '../components/skillsList'; // Import predefined skills

const HRPostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    requiredSkills: [], // Will be used for ReactTags
    salary: '',
    location: '',
    companyName: localStorage.getItem('companyName') || '', // Set company name from local storage
    status: 'open', // Default status
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling the button
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  // Handle form changes for general input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate('/');
      return;
    }

    if (formData.requiredSkills.length === 0) {
      setMessage("Please enter required skills.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting job...");

    setTimeout(async () => {
      try {
        console.log('Submitting job with data:', formData); // Log the form data
        const response = await axios.post(
          `${process.env.REACT_APP_API_ADDRESS}/api/jobs/post`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Server response:', response.data); // Log the server response
        setMessage(response.data.message || "Job posted successfully!");
        navigate('/hr/posted-jobs'); // Redirect to posted jobs page after successful submission
      } catch (error) {
        console.error('Error posting job:', error.response.data); // Log the error response
        if (error.response.status === 401) {
          navigate('/');
        } else {
          setMessage("Failed to post job. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }, 3000); // 3 seconds delay
  };

  return (
    <div className="form-container">
      <h1>Post a New Job</h1>
      <form onSubmit={handleSubmit} className="job-form">
        <input 
          type="text" 
          name="title" 
          placeholder="Job Title" 
          value={formData.title} 
          onChange={handleChange}
          required 
        />
        <textarea 
          name="description" 
          placeholder="Job Description" 
          value={formData.description} 
          onChange={handleChange}
          required 
        />
        <textarea 
          name="requirements" 
          placeholder="Job Requirements" 
          value={formData.requirements} 
          onChange={handleChange}
          required 
        />
        <input 
          type="text" 
          name="salary" 
          placeholder="Salary Range" 
          value={formData.salary} 
          onChange={handleChange}
        />
        <input 
          type="text" 
          name="location" 
          placeholder="Location" 
          value={formData.location} 
          onChange={handleChange}
          required 
        />
        <input 
          type="text" 
          name="companyName" 
          placeholder="Company Name" 
          value={formData.companyName} 
          onChange={handleChange}
          readOnly
          required 
        />

      {/* React Tags for Required Skills */}
      <div className="form-group">
          <label htmlFor="requiredSkills">Required Skills</label>
          <ReactTags
            tags={formData.requiredSkills.map((skill) => ({ id: skill, text: skill }))} // Map required skills to tags
            suggestions={predefinedSkills.map((skill) => ({ id: skill, text: skill }))} // Use predefined suggestions
            handleDelete={(index) => {
              const newSkills = [...formData.requiredSkills];
              newSkills.splice(index, 1); // Remove skill tag
              setFormData({ ...formData, requiredSkills: newSkills });
            }}
            handleAddition={(newTag) => {
              setFormData({ ...formData, requiredSkills: [...formData.requiredSkills, newTag.text] }); // Add new skill
            }}
            inputFieldPosition="bottom" // Position of the input field
            autocomplete // Enable autocomplete for the input
          />
        </div>

        {/* Status Field */}
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className={`btn ${isSubmitting ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isSubmitting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
      
      {message && <div className="announcement">{message}</div>}
    </div>
  );
};

export default HRPostJob;
