// src/pages/AdminReports.js
import React from 'react';
import Card from '../components/Card';
import '../css/TalentDashboard.css';

const AdminReports = () => {
  return (
    <div className="dashboard-container">
      <h1>Reports</h1>
      
      <div className="greeting-container">
        <p className="text-gray-600">
          Generate and export reports for DOLE, SSU, and other stakeholders.
        </p>
      </div>

      <div className="cards-container">
        <Card title="Coming Soon">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Report Generation</h3>
            <p className="text-gray-600 mb-4">
              This page will allow you to generate and export reports including:
            </p>
            <ul className="text-left text-gray-700 space-y-2">
              <li>• Quarterly talent registration reports</li>
              <li>• Employment placement reports</li>
              <li>• SSU graduate tracking reports</li>
              <li>• HR partner engagement reports</li>
              <li>• Job posting statistics</li>
              <li>• Custom date range reports</li>
              <li>• Export to CSV, Excel, or PDF</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
