import React from 'react';

const tips = [
  'Try stacking a 1-minute habit with a morning task!',
  'Motivation is what gets you started. Habit is what keeps you going.',
  'Small steps every day lead to big results.',
  '💡 Tip: Review your streaks to stay motivated!',
  '“Success is the sum of small efforts, repeated day in and day out.”',
];

export default function InsightsList() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Insights & Tips</h2>
      <div className="grid gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="bg-blue-50 text-blue-900 rounded-lg p-4 shadow-sm">
            {tip}
          </div>
        ))}
      </div>
      <div className="mt-6 text-gray-500 text-sm">Random quote: “{tips[Math.floor(Math.random() * tips.length)]}”</div>
    </div>
  );
} 