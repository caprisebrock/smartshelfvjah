// COPY THIS ENTIRE FILE FROM: components/HabitCard.tsx
// Move the complete contents of components/HabitCard.tsx into this file 
import React, { useState, useEffect } from 'react';
import { Trash2, Flame, CheckCircle, Circle } from 'lucide-react';
import { Habit, useHabits } from '../context/HabitsContext';
import { useToast } from '../../shared/context/ToastContext';
import { useUser } from '../../auth/hooks/useUser';
import { supabase } from '../../database/config/databaseConfig';
import ConfirmDeleteModal from '../../shared/components/ConfirmDeleteModal';

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { deleteHabit, markHabitComplete } = useHabits();
  const { addToast } = useToast();
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [completionData, setCompletionData] = useState<{ date: string; completed: boolean }[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteHabit(habit.id);
      if (result.success) {
        // Show success toast (you can implement this later)
        console.log('✅ Habit deleted successfully');
      } else {
        // Show error toast (you can implement this later)
        console.error('❌ Failed to delete habit:', result.error);
        alert(`Failed to delete habit: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting habit:', error);
      alert('An unexpected error occurred while deleting the habit.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fetch completion data for the past 7 days
  const fetchCompletionData = async () => {
    if (!user?.id) return;
    
    setLoadingCompletions(true);
    try {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 days including today
      const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_completions')
        .select('date, status')
        .eq('user_id', user.id)
        .eq('habit_id', habit.id)
        .gte('date', sevenDaysAgoString)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching completion data:', error);
        return;
      }

      // Create a map of completion data
      const completionMap = new Map();
      (data || []).forEach(completion => {
        completionMap.set(completion.date, completion.status === 'complete');
      });

      // Generate array for last 7 days (today first, then going backwards)
      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        last7Days.push({
          date: dateString,
          completed: completionMap.get(dateString) || false
        });
      }

      setCompletionData(last7Days);
    } catch (err) {
      console.error('Error fetching completion data:', err);
    } finally {
      setLoadingCompletions(false);
    }
  };

  // Load completion data when component mounts or habit changes
  useEffect(() => {
    fetchCompletionData();
  }, [user?.id, habit.id]);

  // Refresh completion data after marking complete
  const refreshCompletionData = async () => {
    await fetchCompletionData();
  };

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    try {
      const result = await markHabitComplete(habit.id);
      
      if (result.success) {
        if (result.alreadyCompleted) {
          // Show "Already done" feedback
          addToast('Already done for today! ✅', 'info');
        } else {
          // Show success toast
          addToast('Marked as complete ✅', 'success');
          
          // Refresh completion data to update UI
          await refreshCompletionData();
          
          // Check for new streak celebration
          const newStreak = calculateStreak();
          if (newStreak === 1 && previousStreak === 0) {
            addToast('🎉 Great start! You\'ve begun a new streak!', 'success');
          }
        }
      } else {
        // Show error toast
        addToast(`Failed to mark habit complete: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ Unexpected error marking habit complete:', error);
      addToast('An unexpected error occurred while marking the habit complete.', 'error');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getTodayCompletion = () => {
    const today = getTodayDate();
    return completionData.find(c => c.date === today)?.completed || false;
  };

  const getRecentCompletions = () => {
    return completionData.map(c => c.completed);
  };

  const calculateStreak = () => {
    // Count consecutive completed days starting from today (index 0)
    let streak = 0;
    
    for (let i = 0; i < completionData.length; i++) {
      const completion = completionData[i];
      if (completion.completed) {
        streak++;
      } else {
        // Stop counting when we hit an incomplete day
        break;
      }
    }
    
    return streak;
  };

  const recentCompletions = getRecentCompletions();
  const todayCompleted = getTodayCompletion();
  const currentStreak = calculateStreak();

  // Update previous streak when current streak changes
  useEffect(() => {
    setPreviousStreak(currentStreak);
  }, [currentStreak]);

  return (
    <>
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
              onClick={handleDeleteClick}
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
              {loadingCompletions ? (
                // Loading state
                Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 animate-pulse"
                  />
                ))
              ) : (
                // Completion circles
                recentCompletions.map((completed, i) => (
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
                ))
              )}
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
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 
                shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${todayCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
                }
              `}
            >
              {isMarkingComplete ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline mr-1" />
                  Marking...
                </>
              ) : todayCompleted ? (
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete this habit?"
        description="This will permanently remove the habit and all its progress data."
        itemName={habit.name}
      />
    </>
  );
} 