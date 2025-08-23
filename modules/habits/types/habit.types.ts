import { ReactNode } from 'react'

// ============================================================================
// CORE HABIT TYPES
// ============================================================================

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once'
  specificDays?: string[]
  dateCreated: string
  streak: number
  completions: HabitCompletion[]
}

export interface HabitCompletion {
  date: string
  completed: boolean
}

// ============================================================================
// HABITS CONTEXT TYPES
// ============================================================================

export interface HabitsState {
  habits: Habit[]
  loading: boolean
}

export type HabitsAction = 
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'dateCreated' | 'streak' | 'completions'> }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'DELETE_HABIT_SUCCESS'; payload: string }
  | { type: 'DELETE_HABIT_ERROR'; payload: { habitId: string; error: string } }
  | { type: 'TOGGLE_COMPLETION'; payload: { habitId: string; date: string } }
  | { type: 'MARK_COMPLETE'; payload: { habitId: string; date: string } }
  | { type: 'LOAD_HABITS'; payload: Habit[] }
  | { type: 'SET_LOADING'; payload: boolean }

export interface HabitsContextValue {
  state: HabitsState
  dispatch: React.Dispatch<HabitsAction>
  deleteHabit: (habitId: string) => Promise<DeleteHabitResult>
  markHabitComplete: (habitId: string, date?: string) => Promise<MarkCompleteResult>
}

// ============================================================================
// SERVICE RESULT TYPES
// ============================================================================

export interface DeleteHabitResult {
  success: boolean
  error?: string
}

export interface MarkCompleteResult {
  success: boolean
  error?: string
  alreadyCompleted?: boolean
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface HabitCardProps {
  habit: Habit
}

export interface DeleteHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  habitName: string
  habitEmoji: string
  habitColor: string
  isDeleting: boolean
}

export interface HabitGridProps {
  habits?: Habit[]
}

export interface HabitHistoryProps {
  habitId?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface HabitStatsProps {
  habits: Habit[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface AddHabitFormProps {
  onSubmit?: (habit: Omit<Habit, 'id' | 'dateCreated' | 'streak' | 'completions'>) => void
  onCancel?: () => void
}

export interface CalendarViewProps {
  habits: Habit[]
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface HabitFormData {
  name: string
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once'
  specificDays: string[]
}

export interface CreateHabitPayload {
  user_id: string
  name: string
  emoji: string
  color: string
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once'
  specific_days: string[] | null
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DatabaseHabit {
  id: number
  user_id: string
  name: string
  emoji: string
  color: string
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once'
  specific_days: string[] | null
  created_at: string
  updated_at: string
}

export interface DatabaseHabitCompletion {
  id: number
  habit_id: string
  user_id: string
  date: string
  status: 'complete' | 'incomplete'
  created_at: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PresetColor {
  name: string
  value: string
  class: string
}

export interface DayOfWeek {
  value: string
  label: string
  short: string
}

export interface FormErrors {
  [key: string]: string
}

export interface LoadingState {
  isLoading: boolean
  isDeleting: boolean
  isMarkingComplete: boolean
  isCreating: boolean
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface HabitStats {
  totalHabits: number
  completedToday: number
  currentStreak: number
  longestStreak: number
  completionRate: number
}

export interface StreakData {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompleted: string | null
}

export interface CompletionData {
  date: string
  completed: boolean
}

export interface WeeklyCompletionData {
  [date: string]: CompletionData[]
} 