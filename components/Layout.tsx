import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = false }: LayoutProps) {
  if (showSidebar) {
    return (
      <div className="flex flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </div>
    );
  }
  
  // Full-screen layout for pages without sidebar
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 