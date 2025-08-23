// ============================================================================
// DASHBOARD MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Dashboard module

// ============================================================================
// CORE DASHBOARD INTERFACES
// ============================================================================

export interface DashboardData {
  user: UserProfile;
  habits: Habit[];
  resources: LearningResource[];
  notes: Note[];
  sessions: Session[];
  stats: DashboardStats;
}

export interface DashboardStats {
  totalHabits: number;
  completedHabits: number;
  totalResources: number;
  completedResources: number;
  totalNotes: number;
  totalSessions: number;
  streakDays: number;
  weeklyProgress: number;
}

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  emoji: string;
  color: string;
  isPremium: boolean;
  goalFocus: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// HABIT INTERFACES
// ============================================================================

export interface Habit {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'specific-days' | 'once';
  specificDays?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LEARNING RESOURCE INTERFACES
// ============================================================================

export interface LearningResource {
  id: string;
  userId: string;
  type: string;
  title: string;
  author?: string;
  duration: number;
  progress: number;
  categoryTags: string[];
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTE INTERFACES
// ============================================================================

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  linkedResource?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SESSION INTERFACES
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  title: string;
  duration: number;
  resourceId?: string;
  habitId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface DashboardStatsProps {
  data: DashboardStats;
  className?: string;
}

export interface DashboardPageProps {
  user: UserProfile;
  initialData?: DashboardData;
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface DashboardAPIResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  message?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ResourceType = 'Book' | 'Podcast' | 'Video' | 'Course' | 'Article';
export type HabitFrequency = 'daily' | 'weekly' | 'specific-days' | 'once';
export type DashboardView = 'overview' | 'habits' | 'resources' | 'notes' | 'sessions'; 