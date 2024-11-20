import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [hrDetails, setHrDetails] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/hr/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHrDetails(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  if (!hrDetails) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <div className="space-y-4">
        <p><strong>Username:</strong> {hrDetails.username}</p>
        <p><strong>Email:</strong> {hrDetails.email}</p>
        <p><strong>Company Name:</strong> {hrDetails.companyName}</p>
        <p><strong>Account Created:</strong> {new Date(hrDetails.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Profile;
