import React from 'react';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';

export default function AddHabitForm() {
  const router = useRouter();

  const handleAddHabit = () => {
    router.push('/add-habit');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 text-center">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Building Better Habits</h3>
        <p className="text-gray-600">Create personalized habits with custom emojis, colors, and schedules</p>
      </div>
      <button 
        onClick={handleAddHabit}
        className="bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium mx-auto"
      >
        <Plus size={20} /> 
        Add New Habit
      </button>
    </div>
  );
} 