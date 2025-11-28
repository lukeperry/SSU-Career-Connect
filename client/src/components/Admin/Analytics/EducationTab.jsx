import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';

const EducationTab = () => {
  const [mainData, setMainData] = useState([]);
  const [gradYearEmploymentData, setGradYearEmploymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.lpzb.me';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(`${API_URL}/api/admin/fabric/dataset?entity=education`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMainData(response.data.mainData || []);
        setGradYearEmploymentData(response.data.gradYearEmploymentData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching education data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading education data...</p>
        </div>
      </div>
    );
  }

  // Handle empty data
  if ((!mainData || mainData.length === 0) && (!gradYearEmploymentData || gradYearEmploymentData.length === 0)) {
    return (
      <div className="education-tab bg-gray-50 -m-6 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Education Analysis</h2>
          <p className="text-sm text-gray-600">Educational qualifications and background</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2">No Education Data Available</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Education data requires talents with graduation years. Add more talent profiles with complete education information to see analytics here.
          </p>
        </div>
      </div>
    );
  }

  // Aggregate education levels
  // Aggregate education levels
  const educationCounts = {};
  mainData.forEach(item => {
    if (item.educationLevel) {
      educationCounts[item.educationLevel] = (educationCounts[item.educationLevel] || 0) + item.count;
    }
  });
  const educationLevel = Object.entries(educationCounts).map(([level, count]) => ({ metric: level, count }));

  // Graduation Year Trends (Bar and Line)
  const gradYearData = gradYearEmploymentData.map(item => ({ year: item.graduationYear, count: item.count }));
  const gradYearEmploymentRateData = gradYearEmploymentData.map(item => ({ year: item.graduationYear, employmentRate: item.employmentRate }));

  // College Distribution
  const collegeCounts = {};
  mainData.forEach(item => {
    if (item.college) {
      collegeCounts[item.college] = (collegeCounts[item.college] || 0) + item.count;
    }
  });
  const collegeData = Object.entries(collegeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([college, count]) => ({ name: college, value: count }));

  // Employment Rate by Education Level
  const employmentByEdu = {};
  mainData.forEach(item => {
    if (item.educationLevel) {
      if (!employmentByEdu[item.educationLevel]) {
        employmentByEdu[item.educationLevel] = { employed: 0, total: 0 };
      }
      employmentByEdu[item.educationLevel].total += item.count;
      employmentByEdu[item.educationLevel].employed += item.employed || 0;
    }
  });
  const employmentRateData = Object.entries(employmentByEdu)
    .map(([level, stats]) => ({ name: level, rate: stats.total > 0 ? Math.round((stats.employed / stats.total) * 100) : 0 }));

  // Calculate SSU graduates
  const totalSSUGraduates = mainData.reduce((sum, item) => sum + (item.isSSUGraduate ? item.count : 0), 0);
  const totalTalents = educationLevel.reduce((sum, d) => sum + d.count, 0);
  const ssuAlumniRate = totalTalents > 0 ? ((totalSSUGraduates / totalTalents) * 100).toFixed(1) : 0;

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6'];

  return (
  <div className="education-tab bg-gray-50 -m-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Education Analysis</h2>
        <p className="text-sm text-gray-600">Educational qualifications and background</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Education Levels</span>
          <span className="text-3xl font-bold text-gray-900">{educationLevel.length}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">Total Talents</span>
          <span className="text-3xl font-bold text-gray-900">{totalTalents}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">SSU Graduates</span>
          <span className="text-3xl font-bold text-gray-900">{totalSSUGraduates}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <span className="text-gray-600 text-xs font-semibold uppercase block mb-1">SSU Alumni Rate</span>
          <span className="text-3xl font-bold text-gray-900">{ssuAlumniRate}%</span>
        </div>
      </div>


      {/* Enhanced Education Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graduation Year Trends (Bar and Line) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Graduation Year Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradYearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <h3 className="text-sm font-semibold text-gray-700 mt-8 mb-4">Employment Rate by Graduation Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gradYearEmploymentRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="employmentRate" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* College Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">College Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collegeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]}>
                {collegeData.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employment Rate by Education Level */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Employment Rate by Education Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employmentRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <Bar dataKey="rate" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {educationLevel.map((item, index) => {
            const percentage = totalTalents > 0 ? ((item.count / totalTalents) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{item.metric}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{item.count}</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
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

export default EducationTab;
