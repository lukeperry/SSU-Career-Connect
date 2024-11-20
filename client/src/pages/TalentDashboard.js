// src/pages/TalentDashboard.js
import React, { useEffect, useState } from 'react';
import BASE_URL from '../config';

const TalentDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token

      try {
        const response = await fetch(`${BASE_URL}/dashboard/talent`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setUserData(data); // Save fetched data to state
      } catch (error) {
        console.error('Error fetching Talent dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Talent Dashboard</h1>
      {userData ? (
        <div>
          <p>Welcome, {userData.name}</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TalentDashboard;
