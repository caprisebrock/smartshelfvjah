import React from 'react';

export default function ProgressChart() {
  // No data until user starts tracking
  const hasData = false;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Books Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Notes Added</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-center justify-center">
        {hasData ? (
          // Chart will render here when data exists
          <div className="h-full w-full flex items-end justify-between space-x-2">
            {/* Chart bars will render here */}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center py-8">
            <svg 
              className="w-16 h-16 text-gray-300 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No learning activity yet</h3>
            <p className="text-sm text-gray-400">Start tracking books and notes to see your progress!</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Learning Progress Over Time</p>
        <p className="text-xs mt-1">
          This chart will populate with your actual data as you use the app
        </p>
      </div>
    </div>
  );
} 