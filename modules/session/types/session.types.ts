// ============================================================================
// SESSION MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Session module

// ============================================================================
// CORE SESSION INTERFACES
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  title: string;
  duration: number;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  resourceId?: string;
  habitId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResource {
  id: string;
  type: string;
  title: string;
  author?: string;
  emoji: string;
  duration: number;
  progress: number;
  categoryTags: string[];
}

// ============================================================================
// SESSION STATUS INTERFACES
// ============================================================================

export type SessionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  startTime: Date | null;
  elapsedTime: number;
  totalTime: number;
  currentResource?: SessionResource;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface SessionViewProps {
  userId: string;
  initialResource?: SessionResource;
  className?: string;
}

export interface SessionTimerProps {
  elapsedTime: number;
  totalTime: number;
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
}

export interface SessionControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  className?: string;
}

// ============================================================================
// SESSION MANAGEMENT INTERFACES
// ============================================================================

export interface CreateSessionRequest {
  userId: string;
  title: string;
  duration: number;
  resourceId?: string;
  habitId?: string;
  notes?: string;
}

export interface UpdateSessionRequest {
  id: string;
  updates: Partial<Session>;
}

export interface SessionStats {
  totalSessions: number;
  totalTime: number;
  averageDuration: number;
  longestStreak: number;
  currentStreak: number;
  completionRate: number;
}

// ============================================================================
// TIMER INTERFACES
// ============================================================================

export interface TimerConfig {
  duration: number;
  autoStart: boolean;
  showNotifications: boolean;
  soundEnabled: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  remainingTime: number;
  startTime: Date | null;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface SessionAPIResponse {
  success: boolean;
  session?: Session;
  error?: string;
  message?: string;
}

export interface SessionListResponse {
  success: boolean;
  sessions?: Session[];
  error?: string;
  message?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SessionType = 'focus' | 'break' | 'learning' | 'habit';
export type TimerMode = 'countdown' | 'countup' | 'pomodoro';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_SESSION_DURATION = 25 * 60; // 25 minutes in seconds
export const MIN_SESSION_DURATION = 5 * 60; // 5 minutes in seconds
export const MAX_SESSION_DURATION = 4 * 60 * 60; // 4 hours in seconds 