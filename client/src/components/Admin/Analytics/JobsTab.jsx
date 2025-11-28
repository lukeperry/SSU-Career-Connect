import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const JobsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading jobs data...</p>
        </div>
      </div>
    );
  }

  // Aggregate by status
  const statusCounts = {};
  data.forEach(item => {
    const status = item.status === 'open' ? 'Active' : item.status.charAt(0).toUpperCase() + item.status.slice(1);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ metric: status, count }));

  // Aggregate by industry
  const industryCounts = {};
  data.forEach(item => {
    const industry = item.industry && item.industry !== 'Not Specified' ? item.industry : 'General';
    industryCounts[industry] = (industryCounts[industry] || 0) + 1;
  });
  const industryData = Object.entries(industryCounts).map(([industry, count]) => ({ metric: industry, count })).slice(0, 8);

  // Aggregate by month
  const monthCounts = {};
  data.forEach(item => {
    if (item.monthName) {
      monthCounts[item.monthName] = (monthCounts[item.monthName] || 0) + 1;
    }
  });
  const monthData = Object.entries(monthCounts).map(([month, count]) => ({ metric: month, count }));

  // Prepare chart data
  const statusChartData = statusData.map(item => ({ name: item.metric, value: item.count }));
  const industryChartData = industryData.map(item => ({ name: item.metric, value: item.count }));
  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const totalJobs = data.length;
  const activeJobs = statusData.find(d => d.metric === 'Active')?.count || 0;

  return (
    <div className="jobs-tab bg-gray-50 -m-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Jobs Analysis</h2>
        <p className="text-sm text-gray-600">Job postings and opportunities overview</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Total Jobs</span>
          <span className="text-3xl font-bold text-gray-900">{totalJobs}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Active Postings</span>
          <span className="text-3xl font-bold text-gray-900">{activeJobs}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Industries</span>
          <span className="text-3xl font-bold text-gray-900">{industryData.length}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Months Tracked</span>
          <span className="text-3xl font-bold text-gray-900">{monthData.length}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Job Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Job Status Distribution</h3>
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

        {/* Industry Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Industries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 10 }}
              />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Job Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusData.map((item, index) => {
            const percentage = totalJobs > 0 ? ((item.count / totalJobs) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{item.count}</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
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

      {/* Monthly Trends */}
      {monthData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Job Postings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthData.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-xs text-gray-600 mb-1">{item.metric}</div>
                <div className="text-xl font-bold text-gray-900">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsTab;
