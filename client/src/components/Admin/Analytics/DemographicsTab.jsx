import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DemographicsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('province'); // 'province', 'city', or 'barangay'
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=demographics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching demographics data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // Reset selections when filter changes
  useEffect(() => {
    if (locationFilter === 'province') {
      setSelectedProvince('');
      setSelectedCity('');
    } else if (locationFilter === 'city') {
      setSelectedCity('');
    }
  }, [locationFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading demographics data...</p>
        </div>
      </div>
    );
  }

  // Aggregate data by age group
  const ageGroupCounts = {};
  data.forEach(item => {
    if (item.ageGroup) {
      ageGroupCounts[item.ageGroup] = (ageGroupCounts[item.ageGroup] || 0) + item.count;
    }
  });
  
  // Define age group order
  const ageGroupOrder = ['Under 18', '18-24', '25-34', '35-49', '50+', 'Unknown'];
  const ageData = ageGroupOrder
    .filter(group => ageGroupCounts[group]) // Only include groups that have data
    .map(group => ({ metric: group, count: ageGroupCounts[group] }));

  // Aggregate data by gender
  const genderCounts = {};
  data.forEach(item => {
    if (item.gender) {
      const gender = item.gender.charAt(0).toUpperCase() + item.gender.slice(1).toLowerCase();
      genderCounts[gender] = (genderCounts[gender] || 0) + item.count;
    }
  });
  const genderData = Object.entries(genderCounts).map(([gender, count]) => ({ metric: gender, count }));

  // Get available provinces for dropdown
  const availableProvinces = [...new Set(data.map(item => item.province).filter(p => p && p !== 'Unknown'))];
  
  // Get available cities based on selected province
  const availableCities = selectedProvince 
    ? [...new Set(data.filter(item => item.province === selectedProvince).map(item => item.city).filter(c => c && c !== 'Unknown'))]
    : [];

  // Aggregate location data based on filter type
  const locationCounts = {};
  let filteredData = data;

  // Apply province filter if city or barangay view
  if (locationFilter === 'city' && selectedProvince) {
    filteredData = data.filter(item => item.province === selectedProvince);
  } else if (locationFilter === 'barangay' && selectedCity) {
    filteredData = data.filter(item => item.city === selectedCity);
  }

  // Aggregate based on current filter
  filteredData.forEach(item => {
    let key;
    if (locationFilter === 'province') {
      key = item.province;
    } else if (locationFilter === 'city') {
      key = item.city;
    } else if (locationFilter === 'barangay') {
      key = item.barangay;
    }
    
    if (key && key !== 'Unknown') {
      locationCounts[key] = (locationCounts[key] || 0) + item.count;
    }
  });

  const locationData = Object.entries(locationCounts)
    .map(([location, count]) => ({ metric: location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Show top 10

  // Prepare chart data
  const ageChartData = ageData.map(item => ({ name: item.metric, value: item.count }));
  const genderChartData = genderData.map(item => ({ name: item.metric, value: item.count }));
  const locationChartData = locationData.map(item => ({ name: item.metric, value: item.count }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="demographics-tab bg-gray-50 -m-6 p-6">
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-600">
        <h2 className="text-xl font-semibold text-gray-800">Demographics Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">Talent distribution and demographic insights</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Age Distribution Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} />
              <YAxis tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Locations Bar Chart with Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Top {locationFilter === 'province' ? 'Provinces' : locationFilter === 'city' ? 'Cities/Municipalities' : 'Barangays'}
            </h3>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Type Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">View by:</label>
                <select 
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="province">Province</option>
                  <option value="city">City/Municipality</option>
                  <option value="barangay">Barangay</option>
                </select>
              </div>

              {/* Province Selector (for city view) */}
              {locationFilter === 'city' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">Province:</label>
                  <select 
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Provinces</option>
                    {availableProvinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Selector (for barangay view) */}
              {locationFilter === 'barangay' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600">Province:</label>
                    <select 
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedCity(''); // Reset city when province changes
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Province</option>
                      {availableProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  {selectedProvince && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600">City:</label>
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select City</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Show message if no data for selected filters */}
          {locationData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No data available for the selected filters</p>
              {locationFilter === 'barangay' && !selectedCity && (
                <p className="text-xs mt-2">Please select a province and city to view barangay data</p>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{fontSize: 11}} />
              <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.length}</div>
            <div className="text-xs text-gray-500 mt-1">Data Points</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Talents</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{genderData.length}</div>
            <div className="text-xs text-gray-500 mt-1">Gender Categories</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{locationData.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {locationFilter === 'province' ? 'Provinces' : locationFilter === 'city' ? 'Cities' : 'Barangays'} Shown
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default DemographicsTab;
