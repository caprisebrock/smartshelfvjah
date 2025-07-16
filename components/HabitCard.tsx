import React from 'react';
import { Trash2, Flame, CheckCircle, Circle } from 'lucide-react';
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
    <div className="card-interactive group animate-fadeIn">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110"
              style={{ backgroundColor: habit.color }}
            >
              <span className="text-2xl">{habit.emoji}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                {habit.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {habit.frequency === 'specific-days' && habit.specificDays 
                  ? habit.specificDays.join(', ')
                  : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="btn-icon text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Completion Grid */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Last 7 days</span>
            <span className="text-xs text-gray-500">Today →</span>
          </div>
          <div className="flex gap-2">
            {recentCompletions.map((completed, i) => (
              <div
                key={i}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 
                  transition-all duration-200 hover:scale-110
                  ${completed 
                    ? 'bg-green-100 border-green-300 text-green-700 shadow-md' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
                  }
                `}
              >
                {completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              <Flame className={`w-4 h-4 mr-1 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className={`font-medium ${currentStreak > 0 ? 'text-orange-700' : 'text-gray-500'}`}>
                {currentStreak} day streak
              </span>
            </div>
          </div>
          
          <button
            onClick={handleToggleCompletion}
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 
              shadow-md hover:shadow-lg hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${todayCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
              }
            `}
          >
            {todayCompleted ? (
              <>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Completed
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 inline mr-1" />
                Mark Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 