// SETTINGS MODULE INDEX
// This file exports all public APIs for the settings module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as SettingsForm } from './components/SettingsForm'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No hooks currently needed for settings module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for settings module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/settings.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const SettingsModule = {
  components: {
    SettingsForm: () => import('./components/SettingsForm')
  },
  pages: {
    // SettingsPage removed - now in /pages/settings.tsx
  },
  types: () => import('./types/settings.types')
}

export default SettingsModule 