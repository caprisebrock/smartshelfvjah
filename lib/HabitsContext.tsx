import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
}

type HabitsAction = 
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'dateCreated' | 'streak' | 'completions'> }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_COMPLETION'; payload: { habitId: string; date: string } };

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
    
    default:
      return state;
  }
};

export const HabitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(habitsReducer, { habits: [] });

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