// ASK-AI MODULE INDEX
// This file exports all public APIs for the ask-ai module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as AskAIForm } from './components/AskAIForm'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

// No hooks currently needed for ask-ai module

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// No services currently needed for ask-ai module

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types/ask-ai.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const AskAIModule = {
  components: {
    AskAIForm: () => import('./components/AskAIForm')
  },
  pages: {
    // AskAIPage removed - now in /pages/ask-ai.tsx
  },
  types: () => import('./types/ask-ai.types')
}

export default AskAIModule 