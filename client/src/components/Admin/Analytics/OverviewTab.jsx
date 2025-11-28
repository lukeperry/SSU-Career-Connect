import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OverviewTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  const fetchOverviewData = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const getMetricConfig = (metric) => {
    const configs = {
      'Total Talents': { 
        icon: '👥', 
        color: 'from-blue-500 to-blue-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      'Total Jobs': { 
        icon: '💼', 
        color: 'from-green-500 to-green-600',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      'Total Applications': { 
        icon: '📄', 
        color: 'from-purple-500 to-purple-600',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      'Active Jobs': { 
        icon: '✨', 
        color: 'from-orange-500 to-orange-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      'Pending Applications': { 
        icon: '⏳', 
        color: 'from-yellow-500 to-yellow-600',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      'Placement Rate': { 
        icon: '🎯', 
        color: 'from-pink-500 to-pink-600',
        textColor: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
      'Average Match Score': { 
        icon: '⭐', 
        color: 'from-indigo-500 to-indigo-600',
        textColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      }
    };
    return configs[metric] || configs['Total Talents'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading overview data...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.metric.replace('Total ', '').replace('Average ', 'Avg '),
    value: item.value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  return (
    <div className="overview-tab bg-gray-50 -m-6 p-6">
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-600">
        <h2 className="text-xl font-semibold text-gray-800">Key Performance Indicators</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of platform metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.map((item, index) => {
          const config = getMetricConfig(item.metric);
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
                    {item.metric}
                  </span>
                  <span className="text-2xl opacity-50">{config.icon}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {item.value}
                  </span>
                  {item.metric.includes('Rate') || item.metric.includes('Score') ? (
                    <span className="text-sm text-gray-500">%</span>
                  ) : null}
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                  {item.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Metrics Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 11}} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribution Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total Metrics</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Combined Total</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Average Value</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-green-600">●</div>
            <div className="text-xs text-gray-500 mt-1">Live Data</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Last updated: {new Date().toLocaleString()} • Auto-refresh enabled
      </div>
    </div>
  );
};

export default OverviewTab;
