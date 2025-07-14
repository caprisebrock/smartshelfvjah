import React from 'react';
import Layout from '../components/Layout';

export default function ProgressPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Progress Overview</h1>
        <div className="flex gap-2 mb-8">
          <button className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold">Weekly</button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold">Monthly</button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold">Yearly</button>
        </div>
        {/* Calendar Highlights */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">📆 Calendar Highlights</h2>
          <div className="border border-gray-200 rounded-lg p-8 text-gray-400 text-center">Calendar coming soon</div>
        </section>
        {/* Stats / Graphs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">📊 Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="font-bold mb-2">Habit Completion Rate</div>
              <div className="h-24 flex items-center justify-center text-gray-400">Chart coming soon</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="font-bold mb-2">Streak Duration</div>
              <div className="h-24 flex items-center justify-center text-gray-400">Chart coming soon</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="font-bold mb-2">Most Missed Habits</div>
              <div className="h-24 flex items-center justify-center text-gray-400">Chart coming soon</div>
            </div>
          </div>
        </section>
        {/* Habit History */}
        <section>
          <h2 className="text-xl font-semibold mb-3">📚 Habit History</h2>
          <div className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-8 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
            <div className="font-semibold">You haven’t logged any habit data yet</div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 