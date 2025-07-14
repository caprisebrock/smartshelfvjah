import React from 'react';
import { Trash2 } from 'lucide-react';
import { Habit, useHabits } from '../lib/HabitsContext';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { dispatch } = useHabits();

  const handleDelete = () => {
    dispatch({ type: 'DELETE_HABIT', payload: habit.id });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleToggleCompletion = () => {
    const today = getTodayDate();
    dispatch({
      type: 'TOGGLE_COMPLETION',
      payload: { habitId: habit.id, date: today }
    });
  };

  const getTodayCompletion = () => {
    const today = getTodayDate();
    return habit.completions.find(c => c.date === today)?.completed || false;
  };

  const getRecentCompletions = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const completion = habit.completions.find(c => c.date === dateString);
      last7Days.push(completion?.completed || false);
    }
    return last7Days;
  };

  const calculateStreak = () => {
    const sortedCompletions = habit.completions
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedCompletions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].date);
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        streak = 1;
      } else if (i > 0 && daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const recentCompletions = getRecentCompletions();
  const todayCompleted = getTodayCompletion();
  const currentStreak = calculateStreak();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: habit.color }}
          >
            <span className="text-xl">{habit.emoji}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-800">{habit.name}</h3>
            <p className="text-sm text-gray-600">
              {habit.frequency === 'specific-days' && habit.specificDays 
                ? habit.specificDays.join(', ')
                : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Completion Grid */}
      <div className="flex gap-1">
        {recentCompletions.map((completed, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border ${
              completed 
                ? 'bg-green-400 border-green-400 text-white' 
                : 'bg-gray-200 border-gray-200 text-gray-500'
            }`}
          >
            {completed ? '✓' : '○'}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1">🔥</span>
          <span>{currentStreak}-day streak</span>
        </div>
        <button
          onClick={handleToggleCompletion}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            todayCompleted
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {todayCompleted ? 'Completed' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
} 