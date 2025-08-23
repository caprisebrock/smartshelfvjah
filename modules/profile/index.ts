// PROFILE MODULE INDEX
// This file exports all public APIs for the profile module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as ProfileForm } from './components/ProfileForm'
export { default as ProfilePanel } from './components/ProfilePanel'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No hooks currently needed for profile module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for profile module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/profile.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const ProfileModule = {
  components: {
    ProfileForm: () => import('./components/ProfileForm'),
    ProfilePanel: () => import('./components/ProfilePanel')
  },
  pages: {
    // ProfilePage removed - now in /pages/profile.tsx
  },
  types: () => import('./types/profile.types')
}

export default ProfileModule 