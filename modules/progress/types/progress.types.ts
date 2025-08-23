// ============================================================================
// PROGRESS MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Progress module
// Extracted from the moved files to ensure type safety and consistency

// ============================================================================
// CORE PROGRESS INTERFACES
// ============================================================================

export interface LearningResource {
  id: string;
  user_id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration_minutes: number;
  progress_minutes: number;
  category_tags: string[];
  reminder_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressData {
  date: string;
  minutes: number;
  fullDate: string;
}

export interface HabitProgress {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

// ============================================================================
// CHART AND VISUALIZATION INTERFACES
// ============================================================================

export interface ChartDataPoint {
  date: string;
  minutes: number;
  fullDate: string;
}

export interface HabitChartData {
  date: string;
  completed: number;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

export interface ChartRange {
  start: Date;
  end: Date;
  label: string;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface ProgressChartProps {
  data: ChartDataPoint[];
  range: string;
  hasData: boolean;
}

export interface StatBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: StatBadgeColor;
  className?: string;
}

export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: StatBadgeColor;
  className?: string;
}

export interface HabitStatsProps {
  data?: HabitChartData[];
  showCharts?: boolean;
  className?: string;
}

export interface HabitHistoryProps {
  history?: HabitHistoryEntry[];
  showFilters?: boolean;
  className?: string;
}

export interface InsightsListProps {
  tips?: string[];
  showRandomQuote?: boolean;
  className?: string;
}

// ============================================================================
// HABIT INTERFACES
// ============================================================================

export interface HabitHistoryEntry {
  date: string;
  habits: HabitEntry[];
}

export interface HabitEntry {
  name: string;
  emoji: string;
  done: boolean;
  id?: string;
}

export interface HabitStats {
  longestStreak: number;
  completionRate: number;
  totalHabits: number;
  completedToday: number;
}

export interface HabitProgressData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

export interface ProgressStats {
  totalMinutes: number;
  averagePerDay: number;
  totalSessions: number;
  longestStreak: number;
  currentStreak: number;
}

export interface LearningStats {
  resourcesCompleted: number;
  totalResources: number;
  averageProgress: number;
  favoriteCategory: string;
  timeSpent: number;
}

export interface StreakData {
  current: number;
  longest: number;
  startDate: string;
  endDate?: string;
}

export interface CompletionData {
  total: number;
  completed: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// TIME RANGE INTERFACES
// ============================================================================

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
  days: number;
}

// ============================================================================
// FILTER AND SORT INTERFACES
// ============================================================================

export interface ProgressFilter {
  timeRange: TimeRange;
  category?: string;
  resourceType?: string;
  minProgress?: number;
  maxProgress?: number;
}

export interface ProgressSort {
  field: 'date' | 'minutes' | 'progress' | 'title';
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// ============================================================================
// COLOR AND STYLING INTERFACES
// ============================================================================

export type StatBadgeColor = 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red' | 'gray';

export interface ColorVariants {
  bg: string;
  iconColor: string;
  labelColor: string;
  valueColor: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface ProgressResponse {
  success: boolean;
  data: ProgressData[];
  total: number;
  range: TimeRange;
}

export interface StatsResponse {
  success: boolean;
  stats: ProgressStats;
  learningStats: LearningStats;
  habitStats: HabitStats;
}

export interface HistoryResponse {
  success: boolean;
  history: HabitHistoryEntry[];
  total: number;
  page: number;
}

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

export interface DatabaseProgress {
  id: string;
  user_id: string;
  resource_id: string;
  minutes_spent: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseHabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed: boolean;
  date: string;
  created_at: string;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface ProgressSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface ProgressGoal {
  target: number;
  current: number;
  percentage: number;
  remaining: number;
  deadline?: string;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  achieved: boolean;
  achievedDate?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'yearly', label: 'Yearly', days: 365 }
];

export const STAT_BADGE_COLORS: StatBadgeColor[] = [
  'blue', 'green', 'purple', 'orange', 'yellow', 'red', 'gray'
];

export const PROGRESS_CATEGORIES = [
  'All', 'Business', 'Technology', 'Health', 'Personal Development', 'Education'
];

// ============================================================================
// HELPER FUNCTION TYPES
// ============================================================================

export type DateKeyFunction = (dateStr: string, range: TimeRange) => string;
export type DateRangeGenerator = (range: TimeRange) => string[];
export type ProgressCalculator = (data: ProgressData[]) => ProgressStats;
export type FilterFunction = (data: any[], filter: ProgressFilter) => any[];
export type SortFunction = (data: any[], sort: ProgressSort) => any[]; 