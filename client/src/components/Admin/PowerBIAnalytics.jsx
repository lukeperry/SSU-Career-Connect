import React, { useState } from 'react';

/**
 * Power BI Analytics Component - Simple iFrame Embed
 * Embeds Power BI reports directly into the admin analytics section
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create report in Power BI Service (https://app.powerbi.com)
 * 2. Click File → Embed report → Website or portal
 * 3. Copy the embed URL
 * 4. Replace POWER_BI_EMBED_URL below with your URL
 */
const PowerBIAnalytics = () => {
  // Power BI public embed URL for SSU Career Connect Dashboard (Publish to Web)
  const POWER_BI_EMBED_URL = 'https://app.powerbi.com/view?r=eyJrIjoiYzhiMzcyZDEtOGQ2Mi00OTg2LWE4Y2EtZDM2ZjVjNGE2MTJmIiwidCI6Ijc4Mzc3OTc0LThiNjItNDQwNy05YjIwLTgyNzcyZTVjNTk3ZSIsImMiOjEwfQ%3D%3D';
  
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('✅ Power BI Report loaded successfully');
  };

  return (
    <div className="power-bi-analytics-container p-6 bg-gray-50 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-7xl mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Real-time insights powered by Microsoft Fabric
        </p>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center h-96 w-4/5 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Power BI Report...</p>
          </div>
        </div>
      )}

      {/* Power BI Embed - 80% width */}
      <div className={`powerbi-embed-wrapper w-4/5 ${isLoading ? 'hidden' : 'block'}`}>
        <iframe
          title="SSU Career Connect Analytics"
          className="w-full bg-white rounded-lg shadow-lg"
          style={{ height: '80vh', minHeight: '600px', border: 'none' }}
          src={POWER_BI_EMBED_URL}
          frameBorder="0"
          allowFullScreen={true}
          onLoad={handleIframeLoad}
        />
      </div>

      {/* Info Banner */}
      <div className="mt-4 w-4/5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Reports refresh automatically. Data is pulled from your SSU Career Connect database in real-time.
        </p>
      </div>
    </div>
  );
};

export default PowerBIAnalytics;
