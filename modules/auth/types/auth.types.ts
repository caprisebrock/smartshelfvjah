import { ReactNode } from 'react'
import { SupabaseClient, User } from '@supabase/supabase-js'

// ============================================================================
// AUTH WRAPPER TYPES
// ============================================================================

export interface AuthWrapperProps {
  children: ReactNode
}

// ============================================================================
// USER HOOK TYPES
// ============================================================================

export interface UserHookReturn {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'PASSWORD_RECOVERY'
  | 'USER_UPDATED'

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface AppUserProfile {
  id: string
  email: string
  name: string
  emoji: string
  color: string
  is_premium: boolean
  goal_focus: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface CreateUserProfileResult {
  success: boolean
  isExisting?: boolean
  profile?: AppUserProfile
  error?: Error | any
}

export interface PublicUserData {
  name?: string
  emoji?: string
  color?: string
  goal_focus?: string
}

// ============================================================================
// AUTH SERVICE TYPES
// ============================================================================

export interface AuthService {
  supabase: SupabaseClient
  user: User | null
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
}

export interface GoogleSignInError {
  message: string
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface GoogleSignInButtonProps {
  disabled?: boolean
  onError?: (error: string) => void
}

export interface SignOutButtonProps {
  variant?: 'default' | 'sidebar' | 'minimal'
  className?: string
  children?: ReactNode
}

// ============================================================================
// ROUTING TYPES
// ============================================================================

export type PublicPage = 
  | '/login'
  | '/signup'
  | '/sign-up'
  | '/auth'
  | '/auth/callback'
  | '/api/auth/callback'

export interface RouteGuard {
  isPublicPage: boolean
  requiresAuth: boolean
} 