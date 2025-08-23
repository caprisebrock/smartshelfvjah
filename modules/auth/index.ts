// AUTH MODULE INDEX
// This file exports all public APIs for the auth module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as AuthWrapper } from './components/AuthWrapper'
export { default as GoogleSignInButton } from './components/GoogleSignInButton'
export { default as SignOutButton } from './components/SignOutButton'
export { default as UserMenu } from './components/UserMenu'

// ============================================================================
// PAGE EXPORTS - REMOVED
// ============================================================================
// Pages are now in /pages/ directory for Next.js routing
// Individual pages import from this module's components/hooks/services

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useUser } from './hooks/useUser'
export { useProtectedRoute } from './hooks/useProtectedRoute'

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { createUserProfile } from './services/createUserProfile'
export { ensurePublicUser } from './services/ensurePublicUser'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Component Props
  AuthWrapperProps,
  GoogleSignInButtonProps,
  SignOutButtonProps,
  
  // Hook Return Types
  UserHookReturn,
  
  // Auth Event Types
  AuthEvent,
  
  // User Profile Types
  AppUserProfile,
  CreateUserProfileResult,
  PublicUserData,
  
  // Service Types
  AuthService,
  
  // Form Data Types
  LoginFormData,
  SignupFormData,
  
  // Error Types
  GoogleSignInError,
  
  // Route Guard Types
  PublicPage,
  RouteGuard
} from './types/auth.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const AuthModule = {
  components: {
    AuthWrapper: () => import('./components/AuthWrapper'),
    GoogleSignInButton: () => import('./components/GoogleSignInButton'),
    SignOutButton: () => import('./components/SignOutButton'),
    UserMenu: () => import('./components/UserMenu')
  },
  // pages: removed - now in /pages/ directory for Next.js routing
  hooks: {
    useUser: () => import('./hooks/useUser'),
    useProtectedRoute: () => import('./hooks/useProtectedRoute')
  },
  services: {
    createUserProfile: () => import('./services/createUserProfile'),
    ensurePublicUser: () => import('./services/ensurePublicUser')
  },
  types: () => import('./types/auth.types')
}

export default AuthModule 