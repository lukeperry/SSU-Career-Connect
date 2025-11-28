import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ApplicationsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applications data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading applications data...</p>
        </div>
      </div>
    );
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="applications-tab bg-gray-50 -m-6 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Applications Analysis</h2>
          <p className="text-sm text-gray-600">Application tracking and status overview</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2">No Applications Yet</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Once talents start applying for jobs, their application data will appear here with status tracking, trends, and conversion analytics.
          </p>
        </div>
      </div>
    );
  }

  // Aggregate by status
  const statusCounts = {};
  data.forEach(item => {
    if (item.status) {
      const status = item.status.charAt(0).toUpperCase() + item.status.slice(1);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ metric: status, count }));

  // Aggregate by month
  const monthCounts = {};
  data.forEach(item => {
    if (item.monthName) {
      monthCounts[item.monthName + ' ' + item.year] = (monthCounts[item.monthName + ' ' + item.year] || 0) + 1;
    }
  });
  const monthlyData = Object.entries(monthCounts).map(([month, count]) => ({ metric: month, count }));

  // Calculate totals
  const totalApplications = data.length;
  const pendingCount = statusData.find(d => d.metric === 'Pending')?.count || 0;
  const acceptedCount = statusData.find(d => d.metric === 'Accepted')?.count || 0;
  const successRate = totalApplications > 0 ? ((acceptedCount / totalApplications) * 100).toFixed(1) : 0;

  // Prepare chart data
  const statusChartData = statusData.map(item => ({ name: item.metric, value: item.count }));
  const monthlyChartData = monthlyData.map(item => ({ name: item.metric, value: item.count }));
  const COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#EC4899'];

  return (
    <div className="applications-tab bg-gray-50 -m-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Applications Analysis</h2>
        <p className="text-sm text-gray-600">Application tracking and status overview</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Total Applications</span>
          <span className="text-3xl font-bold text-gray-900">{totalApplications}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Pending Review</span>
          <span className="text-3xl font-bold text-gray-900">{pendingCount}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Accepted</span>
          <span className="text-3xl font-bold text-gray-900">{acceptedCount}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Success Rate</span>
          <span className="text-3xl font-bold text-gray-900">{successRate}%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Application Status Distribution</h3>
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

        {/* Monthly Trends Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Application Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
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
              <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusData.map((item, index) => {
            const percentage = totalApplications > 0 ? ((item.count / totalApplications) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{item.count}</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-600 h-2 rounded-full"
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

      {/* Conversion Funnel */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion Funnel</h3>
          <div className="space-y-2">
            {['Pending', 'Under Review', 'Shortlisted', 'Accepted'].map((status, index) => {
              const item = statusData.find(d => d.metric === status);
              const count = item?.count || 0;
              const percentage = totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(1) : 0;
              const widths = ['100%', '85%', '60%', '40%'];
              const bgColors = ['bg-yellow-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'];

              return (
                <div key={index} className="relative">
                  <div 
                    className={`${bgColors[index]} rounded-lg p-3 transition-all duration-300`}
                    style={{ width: widths[index] }}
                  >
                    <div className="flex items-center justify-between text-white text-sm">
                      <span className="font-semibold">{status}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
