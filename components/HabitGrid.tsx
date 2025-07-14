import React from 'react';
import Link from 'next/link';
import HabitCard from './HabitCard';
import { useHabits } from '../lib/HabitsContext';

export default function HabitGrid() {
  const { state } = useHabits();

  if (state.habits.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Building Better Habits</h3>
        <p className="text-gray-600 mb-4">Create personalized habits with custom emojis, colors, and schedules</p>
        <Link 
          href="/add-habit"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add New Habit
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {state.habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
} 