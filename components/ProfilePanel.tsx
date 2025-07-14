import React from 'react';
import { User, RefreshCcw, Download } from 'lucide-react';

export default function ProfilePanel() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
        <User size={48} className="text-gray-400" />
      </div>
      <div className="font-semibold text-lg mb-1">caprisebrock@email.com</div>
      <div className="text-gray-500 mb-4">Username</div>
      <div className="bg-yellow-100 text-yellow-800 rounded px-3 py-1 mb-4">Coming Soon: Authentication Integration</div>
      <div className="flex gap-2 mt-2">
        <button className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded px-3 py-1 hover:bg-gray-200">
          <RefreshCcw size={16} /> Reset Progress
        </button>
        <button className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded px-3 py-1 hover:bg-blue-200">
          <Download size={16} /> Export Data
        </button>
      </div>
    </div>
  );
} 