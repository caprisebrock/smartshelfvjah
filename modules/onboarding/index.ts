// ONBOARDING MODULE INDEX
// This file exports all public APIs for the onboarding module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as OnboardingStep1 } from './components/OnboardingStep1'
export { default as OnboardingStep2 } from './components/OnboardingStep2'
export { default as FirstHabitForm } from './components/FirstHabitForm'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/onboarding/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useOnboardingGuard } from './hooks/useOnboardingGuard'

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for onboarding module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/onboarding.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const OnboardingModule = {
  components: {
    OnboardingStep1: () => import('./components/OnboardingStep1'),
    OnboardingStep2: () => import('./components/OnboardingStep2'),
    FirstHabitForm: () => import('./components/FirstHabitForm')
  },
  pages: {
    // Onboarding pages removed - now in /pages/onboarding/
  },
  hooks: {
    useOnboardingGuard: () => import('./hooks/useOnboardingGuard')
  },
  types: () => import('./types/onboarding.types')
}

export default OnboardingModule 