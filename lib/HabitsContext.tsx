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
  | { type: 'TOGGLE_COMPLETION'; payload: { habitId: string; date: string } }
  | { type: 'LOAD_HABITS'; payload: Habit[] }
  | { type: 'SET_LOADING'; payload: boolean };

const HabitsContext = createContext<{
  state: HabitsState;
  dispatch: React.Dispatch<HabitsAction>;
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
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload)
      };
    
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

  // Load habits from Supabase when user is available
  useEffect(() => {
    if (!user?.id) return;

    const loadHabits = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading habits:', error);
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
    <HabitsContext.Provider value={{ state, dispatch }}>
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