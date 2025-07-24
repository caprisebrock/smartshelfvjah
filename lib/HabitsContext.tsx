import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './useUser';

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

interface HabitsState {
  habits: Habit[];
  loading: boolean;
}

type HabitsAction = 
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'dateCreated' | 'streak' | 'completions'> }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'DELETE_HABIT_SUCCESS'; payload: string }
  | { type: 'DELETE_HABIT_ERROR'; payload: { habitId: string; error: string } }
  | { type: 'TOGGLE_COMPLETION'; payload: { habitId: string; date: string } }
  | { type: 'LOAD_HABITS'; payload: Habit[] }
  | { type: 'SET_LOADING'; payload: boolean };

const HabitsContext = createContext<{
  state: HabitsState;
  dispatch: React.Dispatch<HabitsAction>;
  deleteHabit: (habitId: string) => Promise<{ success: boolean; error?: string }>;
} | null>(null);

const habitsReducer = (state: HabitsState, action: HabitsAction): HabitsState => {
  switch (action.type) {
    case 'ADD_HABIT':
      const newHabit: Habit = {
        ...action.payload,
        id: Date.now().toString(),
        dateCreated: new Date().toISOString(),
        streak: 0,
        completions: []
      };
      return {
        ...state,
        habits: [...state.habits, newHabit]
      };
    
    case 'DELETE_HABIT':
      // Optimistically remove from UI
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      };
    
    case 'DELETE_HABIT_SUCCESS':
      // Confirmation that deletion was successful
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      };
    
    case 'DELETE_HABIT_ERROR':
      // Re-add the habit if deletion failed
      console.error('Failed to delete habit:', action.payload.error);
      return state; // Keep the habit in the list since deletion failed
    
    case 'TOGGLE_COMPLETION':
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === action.payload.habitId) {
            const existingCompletion = habit.completions.find(c => c.date === action.payload.date);
            let updatedCompletions;
            
            if (existingCompletion) {
              updatedCompletions = habit.completions.map(c =>
                c.date === action.payload.date 
                  ? { ...c, completed: !c.completed }
                  : c
              );
            } else {
              updatedCompletions = [
                ...habit.completions,
                { date: action.payload.date, completed: true }
              ];
            }
            
            return {
              ...habit,
              completions: updatedCompletions
            };
          }
          return habit;
        })
      };
    
    case 'LOAD_HABITS':
      return {
        ...state,
        habits: action.payload,
        loading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(habitsReducer, { habits: [], loading: false });
  const { user } = useUser();

  // Function to delete habit from Supabase
  const deleteHabit = async (habitId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Optimistically remove from UI
      dispatch({ type: 'DELETE_HABIT', payload: habitId });

      // Delete from Supabase
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting habit from Supabase:', error);
        dispatch({ type: 'DELETE_HABIT_ERROR', payload: { habitId, error: error.message } });
        return { success: false, error: error.message };
      }

      // Confirm successful deletion
      dispatch({ type: 'DELETE_HABIT_SUCCESS', payload: habitId });
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Unexpected error deleting habit:', err);
      dispatch({ type: 'DELETE_HABIT_ERROR', payload: { habitId, error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  };

  // Load habits from Supabase when user is available
  useEffect(() => {
    if (!user?.id) {
      console.log('👤 [HabitsContext] No authenticated user, skipping habits load');
      return;
    }

    const loadHabits = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        console.log('🔍 [HabitsContext] Loading habits for user:', user.id);
        
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [HabitsContext] Error loading habits:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Transform database habits to match our interface
        const transformedHabits: Habit[] = (data || []).map(dbHabit => ({
          id: dbHabit.id.toString(),
          name: dbHabit.name,
          emoji: dbHabit.emoji,
          color: dbHabit.color,
          frequency: dbHabit.frequency,
          specificDays: dbHabit.specific_days || undefined,
          dateCreated: dbHabit.created_at || new Date().toISOString(),
          streak: 0, // TODO: Calculate from completions
          completions: [] // TODO: Load completions from database
        }));

        dispatch({ type: 'LOAD_HABITS', payload: transformedHabits });
      } catch (err) {
        console.error('Error loading habits:', err);
      }
    };

    loadHabits();
  }, [user?.id]);

  return (
    <HabitsContext.Provider value={{ state, dispatch, deleteHabit }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}; 