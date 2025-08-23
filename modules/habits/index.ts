// HABITS MODULE INDEX
// This file exports all public APIs for the habits module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as HabitCard } from './components/HabitCard'
export { default as HabitGrid } from './components/HabitGrid'
export { default as HabitHistory } from './components/HabitHistory'
export { default as HabitStats } from './components/HabitStats'
export { default as AddHabitForm } from './components/AddHabitForm'
export { default as DeleteHabitModal } from './components/DeleteHabitModal'
export { default as CalendarView } from './components/CalendarView'

// ============================================================================
// PAGE EXPORTS - REMOVED
// ============================================================================
// Pages are now in /pages/ directory for Next.js routing

// ============================================================================
// CONTEXT EXPORTS
// ============================================================================

export { HabitsProvider, useHabits } from './context/HabitsContext'

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No additional hooks currently needed for habits module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { calculateStreak } from './services/habitService';
export { getHabitStreak, getTodayDate } from './utils/streakUtils';
export type { StreakResult } from './utils/streakUtils';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core Habit Interfaces
  Habit,
  HabitCompletion,
  
  // State Management
  HabitsState,
  HabitsAction,
  HabitsContextValue,
  
  // Component Props
  HabitCardProps,
  DeleteHabitModalProps,
  HabitGridProps,
  HabitHistoryProps,
  HabitStatsProps,
  AddHabitFormProps,
  CalendarViewProps,
  
  // Form Interfaces
  HabitFormData,
  CreateHabitPayload,
  
  // Database Interfaces
  DatabaseHabit,
  DatabaseHabitCompletion,
  
  // Utility Types
  PresetColor,
  DayOfWeek,
  FormErrors,
  LoadingState,
  
  // Statistics Interfaces
  HabitStats as HabitStatsInterface,
  StreakData,
  CompletionData,
  WeeklyCompletionData
} from './types/habit.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const HabitsModule = {
  components: {
    HabitCard: () => import('./components/HabitCard'),
    HabitGrid: () => import('./components/HabitGrid'),
    HabitHistory: () => import('./components/HabitHistory'),
    HabitStats: () => import('./components/HabitStats'),
    AddHabitForm: () => import('./components/AddHabitForm'),
    DeleteHabitModal: () => import('./components/DeleteHabitModal'),
    CalendarView: () => import('./components/CalendarView')
  },
  pages: {
    // HabitsPage and AddHabitPage removed - now in /pages/
  },
  context: {
    HabitsProvider: () => import('./context/HabitsContext')
  },
  types: () => import('./types/habit.types')
}

export default HabitsModule 