import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const data = [
  { date: '7/1', completed: 3 },
  { date: '7/2', completed: 2 },
  { date: '7/3', completed: 4 },
  { date: '7/4', completed: 1 },
  { date: '7/5', completed: 3 },
];

export default function HabitStats() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Habit Stats</h2>
      <div className="mb-4">
        <span className="font-bold text-green-600">Longest Streak:</span> 6 days
      </div>
      <div className="mb-4">
        <span className="font-bold text-blue-600">Completion Rate:</span> 78%
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} className="">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 