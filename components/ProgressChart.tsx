import React from 'react';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';

interface ProgressChartProps {
  data: Record<string, number>;
  range: string;
  hasData: boolean;
}

export default function ProgressChart({ data, range, hasData }: ProgressChartProps) {
  // Prepare chart data
  const keys = Object.keys(data).sort();
  const maxVal = Math.max(...Object.values(data), 1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md"></div>
            <span className="text-sm font-medium text-gray-700">Minutes Tracked</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Learning Progress</span>
        </div>
      </div>
      
      <div className="relative h-64 bg-gradient-to-t from-gray-50 to-transparent rounded-xl p-4">
        {hasData && keys.length > 0 ? (
          <div className="h-full w-full flex items-end justify-between gap-2">
            {keys.map((key, index) => {
              const height = Math.max(8, (data[key] / maxVal) * 200);
              return (
                <div key={key} className="flex flex-col items-center flex-1 group">
                  <div className="relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                        {data[key]} min
                      </div>
                    </div>
                    
                    {/* Bar */}
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 hover:shadow-xl animate-scaleIn"
                      style={{
                        height: `${height}px`,
                        width: '100%',
                        maxWidth: '32px',
                        animationDelay: `${index * 0.1}s`,
                      }}
                    ></div>
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs text-gray-600 mt-3 text-center font-medium">
                    {range === 'weekly' ? `W${key.split('-W')[1]}` : key}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BarChart3 className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">No learning activity yet</h3>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Start tracking resources to see your progress visualized here. 
              Your learning journey begins with a single step!
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>Chart will populate as you learn</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-medium text-blue-900">
            Learning Progress Over Time
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Track your consistency and watch your learning habits grow
        </p>
      </div>
    </div>
  );
} 