import React from 'react';

const dummyHistory = [
  {
    date: '2024-07-05',
    habits: [
      { name: 'Drink Water', emoji: '💧', done: true },
      { name: 'Read 10 pages', emoji: '📖', done: false },
    ],
  },
  {
    date: '2024-07-04',
    habits: [
      { name: 'Drink Water', emoji: '💧', done: true },
      { name: 'Read 10 pages', emoji: '📖', done: true },
    ],
  },
];

export default function HabitHistory() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Habit History</h2>
      {/* Filters (visual only) */}
      <div className="mb-4 flex gap-2">
        <button className="bg-blue-100 text-blue-700 rounded px-3 py-1">All</button>
        <button className="bg-green-100 text-green-700 rounded px-3 py-1">Completed</button>
        <button className="bg-red-100 text-red-700 rounded px-3 py-1">Missed</button>
      </div>
      <div className="space-y-4">
        {dummyHistory.map((entry) => (
          <div key={entry.date} className="bg-gray-100 rounded-lg p-4">
            <div className="font-semibold text-gray-700 mb-2">{entry.date}</div>
            <div className="flex flex-wrap gap-3">
              {entry.habits.map((habit, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full ${habit.done ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className="text-lg">{habit.emoji}</span>
                  <span>{habit.name}</span>
                  <span>{habit.done ? '✔️' : '❌'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 