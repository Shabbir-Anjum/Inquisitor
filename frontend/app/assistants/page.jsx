'use client';

import React from 'react';
import Dashboard from '@/components/My-agents';
import Sidebar from '@/components/Sidebar';

const DashboardPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex h-screen bg-gray-900">
    {/* Sidebar */}
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } min-h-screen bg-gray-800 border-r border-gray-700`}
    >
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
    </div>

    {/* Main Content */}
    <div className="flex-1 overflow-auto">
    <Dashboard />
    </div>
  </div>
  );
};

export default DashboardPage;