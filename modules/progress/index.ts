// PROGRESS MODULE INDEX
// This file exports all public APIs for the progress module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as ProgressChart } from './components/ProgressChart'
export { default as StatBadge } from './components/StatBadge'
export { default as HabitStatsComponent } from './components/HabitStats'
export { default as HabitHistory } from './components/HabitHistory'
export { default as InsightsList } from './components/InsightsList'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core Progress Interfaces
  LearningResource,
  ProgressData,
  HabitProgress,
  
  // Chart and Visualization Interfaces
  ChartDataPoint,
  HabitChartData,
  ChartTooltipProps,
  ChartRange,
  
  // Component Props
  ProgressChartProps,
  StatBadgeProps,
  StatCardProps,
  HabitStatsProps,
  HabitHistoryProps,
  InsightsListProps,
  
  // Habit Interfaces
  HabitHistoryEntry,
  HabitEntry,
  HabitStats,
  HabitProgressData,
  
  // Statistics Interfaces
  ProgressStats,
  LearningStats,
  StreakData,
  CompletionData,
  
  // Time Range Interfaces
  TimeRange,
  DateRange,
  TimeRangeOption,
  
  // Filter and Sort Interfaces
  ProgressFilter,
  ProgressSort,
  FilterOption,
  
  // Color and Styling Interfaces
  StatBadgeColor,
  ColorVariants,
  ColorScheme,
  
  // API Response Interfaces
  ProgressResponse,
  StatsResponse,
  HistoryResponse,
  
  // Database Interfaces
  DatabaseProgress,
  DatabaseHabitCompletion,
  
  // Utility Interfaces
  ProgressSummary,
  ProgressGoal,
  ProgressMilestone,
  
  // Helper Function Types
  DateKeyFunction,
  DateRangeGenerator,
  ProgressCalculator,
  FilterFunction,
  SortFunction
} from './types/progress.types'

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

export {
  TIME_RANGE_OPTIONS,
  STAT_BADGE_COLORS,
  PROGRESS_CATEGORIES
} from './types/progress.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const ProgressModule = {
  components: {
    ProgressChart: () => import('./components/ProgressChart'),
    StatBadge: () => import('./components/StatBadge'),
    HabitStatsComponent: () => import('./components/HabitStats'),
    HabitHistory: () => import('./components/HabitHistory'),
    InsightsList: () => import('./components/InsightsList')
  },
  pages: {
    // Progress pages removed - now in /pages/
  },
  types: () => import('./types/progress.types')
}

export default ProgressModule 