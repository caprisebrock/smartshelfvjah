// DATABASE MODULE INDEX
// This file exports all public APIs for the database module

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export { supabase, createUserProfile } from './config/databaseConfig'
export { default as DatabaseService } from './config/db'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core Database Interfaces
  Book,
  Note,
  Habit,
  HabitCompletion,
  UserProfile,
  
  // Service Interfaces
  DatabaseServiceInterface,
  
  // Statistics Interfaces
  DatabaseStats,
  
  // Migration Interfaces
  MigrationResult,
  MigrationService,
  
  // Supabase Interfaces
  SupabaseConfig,
  CreateUserProfileResult,
  
  // Utility Types
  DatabaseOperation,
  DatabaseStatus,
  DatabaseOperationResult
} from './types/database.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const DatabaseModule = {
  config: {
    supabase: () => import('./config/databaseConfig'),
    DatabaseService: () => import('./config/db')
  },
  types: () => import('./types/database.types')
}

export default DatabaseModule 