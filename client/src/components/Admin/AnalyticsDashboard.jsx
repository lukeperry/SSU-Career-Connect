import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import PowerBIAnalytics from './PowerBIAnalytics';
import OverviewTab from './Analytics/OverviewTab';
import DemographicsTab from './Analytics/DemographicsTab';
import EmploymentTab from './Analytics/EmploymentTab';
import EducationTab from './Analytics/EducationTab';
import JobsTab from './Analytics/JobsTab';
import ApplicationsTab from './Analytics/ApplicationsTab';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'demographics', 
      name: 'Demographics', 
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      id: 'employment', 
      name: 'Employment', 
      icon: BriefcaseIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'education', 
      name: 'Education', 
      icon: AcademicCapIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      id: 'jobs', 
      name: 'Jobs', 
      icon: BriefcaseIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      id: 'applications', 
      name: 'Applications', 
      icon: DocumentTextIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    { 
      id: 'powerbi', 
      name: 'Power BI', 
      icon: PresentationChartLineIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'powerbi':
        return <PowerBIAnalytics />;
      case 'overview':
        return <OverviewTab />;
      case 'demographics':
        return <DemographicsTab />;
      case 'employment':
        return <EmploymentTab />;
      case 'education':
        return <EducationTab />;
      case 'jobs':
        return <JobsTab />;
      case 'applications':
        return <ApplicationsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="analytics-dashboard min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6">
          <div className="flex space-x-1 overflow-x-auto py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm
                    transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content - Full Width */}
      <div className="px-6 py-6">
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
