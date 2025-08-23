// EXTRACT AND CREATE THIS HOOK FROM: lib/HabitsContext.tsx
// Create a custom hook that provides access to habits state and actions
// This should wrap the HabitsContext and provide a clean API for components 
import { useContext } from 'react';
import { HabitsContext } from '../context/HabitsContext';

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}; 