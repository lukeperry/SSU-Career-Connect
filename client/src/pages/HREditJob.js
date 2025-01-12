import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import '../css/HRPostJob.css'; // Link to the CSS file for styling
import { WithContext as ReactTags } from 'react-tag-input'; // Import the ReactTags component
import { predefinedSkills } from '../components/skillsList'; // Import predefined skills

const HREditJob = () => {
  const { id } = useParams(); // Get the job ID from the URL
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    requiredSkills: [], // Will be used for ReactTags
    salary: '',
    location: '',
    companyName: '', // this will be set to the HR's company
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling the button
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Define the error state
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  useEffect(() => {
    const fetchJob = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ADDRESS}/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const job = response.data.job;
        setFormData({
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          requiredSkills: job.requiredSkills,
          salary: job.salary,
          location: job.location,
          companyName: job.companyName,
        });
      } catch (err) { // Change 'error' to 'err'
        setError('Error fetching job:');
      }
    };

    fetchJob();
  }, [id]);

  const deleteJob = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/');
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}/api/jobs/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/hr/jobs'); // Redirect to the jobs list after deleting the job
    } catch (err) { // Change 'error' to 'err'
      setError("Failed to delete job.");
      console.error("Error deleting job:", err.response ? err.response.data : err.message); // Log the error for debugging
    }
  };
  
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
    setMessage("Updating job...");
    setTimeout(async () => {
      try {
        console.log('Updating job with data:', formData); // Log the form data
        const response = await axios.put(
          `${process.env.REACT_APP_API_ADDRESS}/api/jobs/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Server response:', response.data); // Log the server response
        setMessage(response.data.message || "Job updated successfully!");
        navigate('/hr/posted-jobs'); // Redirect to posted jobs page after successful update
      } catch (err) { // Change 'error' to 'err'
        console.error('Error updating job:', err.response.data); // Log the error response
        if (err.response.status === 401) {
          navigate('/');
        } else {
          setMessage("Failed to update job. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }, 3000); // 3 seconds delay
  };

  return (
    <div className="form-container">
      <h1>Edit Job</h1>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn ${isSubmitting ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isSubmitting ? 'Updating...' : 'Update Job'}
        </button>
        <button type="button" onClick={deleteJob} className="btn btn-danger">Delete Job</button> {/* Add delete button */}
      </form>
      {message && <div className="announcement">{message}</div>}
      {error && <p>{error}</p>} {""}
    </div>
  );
};

export default HREditJob;