// COPY THIS ENTIRE FILE FROM: components/ProgressChart.tsx
// Move the complete contents of components/ProgressChart.tsx into this file 
import React from 'react';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  minutes: number;
  fullDate: string;
}

interface ProgressChartProps {
  data: ChartDataPoint[];
  range: string;
  hasData: boolean;
}

export default function ProgressChart({ data, range, hasData }: ProgressChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            {payload[0].value} minutes
          </p>
        </div>
      );
    }
    return null;
  };

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
        {hasData && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="minutes" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                className="hover:fill-blue-600 transition-colors"
              />
            </BarChart>
          </ResponsiveContainer>
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