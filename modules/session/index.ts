// SESSION MODULE INDEX
// This file exports all public APIs for the session module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as SessionView } from './components/SessionView'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No hooks currently needed for session module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for session module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/session.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const SessionModule = {
  components: {
    SessionView: () => import('./components/SessionView')
  },
  pages: {
    // SessionPage removed - now in /pages/session.tsx
  },
  types: () => import('./types/session.types')
}

export default SessionModule 