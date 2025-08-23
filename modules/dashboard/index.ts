// DASHBOARD MODULE INDEX
// This file exports all public APIs for the dashboard module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as DashboardStats } from './components/DashboardStats'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Pages are now in /pages/ directory for Next.js routing

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No hooks currently needed for dashboard module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for dashboard module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/dashboard.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const DashboardModule = {
  components: {
    DashboardStats: () => import('./components/DashboardStats')
  },
  pages: {
    // DashboardPage removed - now in /pages/index.tsx
  },
  types: () => import('./types/dashboard.types')
}

export default DashboardModule 