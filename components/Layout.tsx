import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
} 