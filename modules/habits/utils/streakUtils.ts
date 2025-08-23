import { supabase } from '../../database/config/databaseConfig';
import { calculateStreak } from '../services/habitService';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  hasActiveStreak: boolean;
}

/**
 * Get the user's current habit streak data
 * Returns the longest current streak across all habits
 */
export async function getHabitStreak(userId: string): Promise<StreakResult> {
  if (!userId) {
    return { currentStreak: 0, longestStreak: 0, hasActiveStreak: false };
  }

  try {
    // Get all user habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId);

    if (habitsError || !habits || habits.length === 0) {
      return { currentStreak: 0, longestStreak: 0, hasActiveStreak: false };
    }

    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;

    // Calculate streak for each habit
    for (const habit of habits) {
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('completed_date, completed')
        .eq('habit_id', habit.id)
        .order('completed_date', { ascending: false });

      if (completionsError || !completions) continue;

      // Transform to match calculateStreak interface
      const formattedCompletions = completions.map(c => ({
        date: c.completed_date,
        completed: c.completed
      }));

      const currentStreak = calculateStreak(formattedCompletions);
      
      // Keep track of the longest current streak across all habits
      if (currentStreak > maxCurrentStreak) {
        maxCurrentStreak = currentStreak;
      }

      // Also track longest streak overall (for future use)
      if (currentStreak > maxLongestStreak) {
        maxLongestStreak = currentStreak;
      }
    }

    return {
      currentStreak: maxCurrentStreak,
      longestStreak: maxLongestStreak,
      hasActiveStreak: maxCurrentStreak >= 2
    };
  } catch (error) {
    console.error('Error calculating habit streak:', error);
    return { currentStreak: 0, longestStreak: 0, hasActiveStreak: false };
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
