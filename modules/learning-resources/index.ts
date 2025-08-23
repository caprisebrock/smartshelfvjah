// LEARNING-RESOURCES MODULE INDEX
// This file exports all public APIs for the learning-resources module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as BookForm } from './components/BookForm'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { default as addBook } from './services/addBook'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Learning Resource Interfaces
  LearningResource,
  Book,
  ResourceFormData,
  
  // Component Props
  BookFormProps,
  
  // Service Interfaces
  AddBookParams,
  AddBookResult,
  
  // Database Interfaces
  DatabaseLearningResource,
  DatabaseBook,
  
  // Form Interfaces
  ResourceFormState,
  ResourceFormErrors,
  
  // API Response Interfaces
  AddBookResponse,
  ResourceResponse,
  
  // Utility Types
  ResourceType,
  ResourceStatus,
  ResourceCategory
} from './types/resource.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const LearningResourcesModule = {
  components: {
    BookForm: () => import('./components/BookForm')
  },
  pages: {
    // Learning resource pages removed - now in /pages/
  },
  services: {
    addBook: () => import('./services/addBook')
  },
  types: () => import('./types/resource.types')
}

export default LearningResourcesModule 