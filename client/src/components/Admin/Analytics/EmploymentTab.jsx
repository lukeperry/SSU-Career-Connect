import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EmploymentTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=employment`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employment data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading employment data...</p>
        </div>
      </div>
    );
  }

  // Aggregate employment status data
  const statusCounts = {};
  data.forEach(item => {
    if (item.employmentStatus) {
      statusCounts[item.employmentStatus] = (statusCounts[item.employmentStatus] || 0) + item.count;
    }
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ metric: status, count }));

  // Aggregate education level data (as proxy for salary ranges since avgSalary is null)
  const educationCounts = {};
  data.forEach(item => {
    if (item.educationLevel) {
      educationCounts[item.educationLevel] = (educationCounts[item.educationLevel] || 0) + item.count;
    }
  });
  const salaryData = Object.entries(educationCounts).map(([level, count]) => ({ metric: level, count }));

  // Calculate totals and percentages
  const totalEmployed = statusData.reduce((sum, item) => sum + item.count, 0);
  const employedCount = statusData.find(d => d.metric === 'Employed')?.count || 0;
  const employmentRate = totalEmployed > 0 ? ((employedCount / totalEmployed) * 100).toFixed(1) : 0;

  // Prepare chart data
  const statusChartData = statusData.map(item => ({ name: item.metric, value: item.count }));
  const educationChartData = salaryData.map(item => ({ name: item.metric, value: item.count }));
  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <div className="employment-tab bg-gray-50 -m-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Employment Analysis</h2>
        <p className="text-sm text-gray-600">Employment status and education level insights</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Currently Employed</span>
              <span className="text-3xl font-bold text-gray-900">{employedCount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Total in Workforce</span>
              <span className="text-3xl font-bold text-gray-900">{totalEmployed}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Employment Rate</span>
              <span className="text-3xl font-bold text-gray-900">{employmentRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Employment Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Employment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Education Level Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Education Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={educationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusData.map((item, index) => {
            const percentage = totalEmployed > 0 ? ((item.count / totalEmployed) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{item.count}</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-600">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmploymentTab;
