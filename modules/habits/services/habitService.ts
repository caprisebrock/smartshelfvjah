// EXTRACT AND CREATE THIS SERVICE FROM: lib/HabitsContext.tsx
// Extract all the business logic, API calls, and data manipulation functions
// This should handle all habit-related operations like CRUD operations 
import { supabase } from '../../database/config/databaseConfig';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once';
  specificDays?: string[];
  dateCreated: string;
  streak: number;
  completions: { date: string; completed: boolean }[];
}

export interface CreateHabitParams {
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once';
  specificDays?: string[];
}

export interface UpdateHabitParams {
  id: string;
  name?: string;
  emoji?: string;
  color?: string;
  frequency?: 'daily' | 'weekly' | 'specific-days' | 'once';
  specificDays?: string[];
}

export interface HabitCompletion {
  habit_id: string;
  user_id: string;
  date: string;
  status: 'complete' | 'incomplete';
}

// Calculate streak from completions
export function calculateStreak(completions: { date: string; completed: boolean }[]): number {
  const sortedCompletions = completions
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
}

// Transform database habit to match our interface
export function transformDatabaseHabit(dbHabit: any, completions: HabitCompletion[]): Habit {
  const habitCompletions = completions
    .filter(c => c.habit_id === dbHabit.id)
    .map(c => ({
      date: c.date,
      completed: c.status === 'complete'
    }));

  return {
    id: dbHabit.id.toString(),
    name: dbHabit.name,
    emoji: dbHabit.emoji,
    color: dbHabit.color,
    frequency: dbHabit.frequency,
    specificDays: dbHabit.specific_days || undefined,
    dateCreated: dbHabit.created_at || new Date().toISOString(),
    streak: calculateStreak(habitCompletions),
    completions: habitCompletions
  };
}

// Load habits for a user
export async function loadHabits(userId: string): Promise<Habit[]> {
  try {
    // Load habits
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [HabitService] Error loading habits:', error);
      throw error;
    }

    // Load completions for all habits
    const habitIds = (data || []).map(habit => habit.id);
    let completionsData: HabitCompletion[] = [];
    
    if (habitIds.length > 0) {
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .in('habit_id', habitIds)
        .eq('user_id', userId);

      if (completionsError) {
        console.error('❌ [HabitService] Error loading completions:', completionsError);
      } else {
        completionsData = completions || [];
      }
    }

    // Transform database habits to match our interface
    return (data || []).map(dbHabit => transformDatabaseHabit(dbHabit, completionsData));
  } catch (err) {
    console.error('❌ [HabitService] Error loading habits:', err);
    throw err;
  }
}

// Create a new habit
export async function createHabit(userId: string, params: CreateHabitParams): Promise<Habit> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: params.name,
        emoji: params.emoji,
        color: params.color,
        frequency: params.frequency,
        specific_days: params.specificDays || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [HabitService] Error creating habit:', error);
      throw error;
    }

    return transformDatabaseHabit(data, []);
  } catch (err) {
    console.error('❌ [HabitService] Error creating habit:', err);
    throw err;
  }
}

// Delete a habit
export async function deleteHabit(habitId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [HabitService] Error deleting habit:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ [HabitService] Unexpected error deleting habit:', err);
    return { success: false, error: errorMessage };
  }
}

// Mark habit as complete
export async function markHabitComplete(
  habitId: string, 
  userId: string, 
  date?: string
): Promise<{ success: boolean; error?: string; alreadyCompleted?: boolean }> {
  try {
    const completionDate = date || new Date().toISOString().split('T')[0];

    // Check if already completed for today
    const { data: existingCompletion, error: checkError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', completionDate)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('❌ [HabitService] Error checking existing completion:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingCompletion) {
      return { success: true, alreadyCompleted: true };
    }

    // Use upsert to insert or update completion record
    const { error: upsertError } = await supabase
      .from('habit_completions')
      .upsert([
        {
          habit_id: habitId,
          user_id: userId,
          date: completionDate,
          status: 'complete'
        }
      ], {
        onConflict: 'user_id,habit_id,date'
      });

    if (upsertError) {
      console.error('❌ [HabitService] Error upserting habit completion:', upsertError);
      return { success: false, error: upsertError.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ [HabitService] Unexpected error marking habit complete:', err);
    return { success: false, error: errorMessage };
  }
}

// Update habit
export async function updateHabit(habitId: string, userId: string, params: UpdateHabitParams): Promise<Habit> {
  try {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (params.name !== undefined) updates.name = params.name;
    if (params.emoji !== undefined) updates.emoji = params.emoji;
    if (params.color !== undefined) updates.color = params.color;
    if (params.frequency !== undefined) updates.frequency = params.frequency;
    if (params.specificDays !== undefined) updates.specific_days = params.specificDays;

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [HabitService] Error updating habit:', error);
      throw error;
    }

    // Load completions for this habit to transform it properly
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId);

    return transformDatabaseHabit(data, completions || []);
  } catch (err) {
    console.error('❌ [HabitService] Error updating habit:', err);
    throw err;
  }
} 