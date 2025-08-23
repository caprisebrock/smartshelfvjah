// ============================================================================
// DATABASE MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Database module

// ============================================================================
// CORE DATABASE INTERFACES
// ============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  status: 'not-started' | 'in-progress' | 'completed';
  notes: string;
  dateAdded: string;
  userId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'business' | 'marketing' | 'leadership' | 'personal-development' | 'other';
  tags: string[];
  bookTitle?: string;
  dateCreated: string;
  isFavorite: boolean;
  userId?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target_days?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string;
  user_id: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  emoji: string;
  color: string;
  is_premium: boolean;
  goal_focus: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DATABASE SERVICE INTERFACES
// ============================================================================

export interface DatabaseServiceInterface {
  // Books
  addBook(book: Omit<Book, 'id'>): Promise<Book>;
  getBooks(userId?: string): Promise<Book[]>;
  updateBook(id: string, updates: Partial<Book>): Promise<Book | null>;
  deleteBook(id: string): Promise<boolean>;
  
  // Notes
  addNote(note: Omit<Note, 'id'>): Promise<Note>;
  getNotes(userId?: string): Promise<Note[]>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note | null>;
  deleteNote(id: string): Promise<boolean>;
  
  // Search and Analytics
  searchNotes(query: string, userId?: string): Promise<Note[]>;
  getStats(userId?: string): Promise<DatabaseStats>;
}

// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

export interface DatabaseStats {
  totalBooks: number;
  completedBooks: number;
  totalNotes: number;
  totalHours: number;
}

// ============================================================================
// MIGRATION INTERFACES
// ============================================================================

export interface MigrationResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface MigrationService {
  runMigrations(): Promise<MigrationResult[]>;
  rollbackMigration(migrationId: string): Promise<MigrationResult>;
}

// ============================================================================
// SUPABASE CLIENT INTERFACES
// ============================================================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      storage?: Storage;
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  };
}

export interface CreateUserProfileResult {
  success: boolean;
  data?: any;
  error?: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DatabaseOperation = 'create' | 'read' | 'update' | 'delete';
export type DatabaseStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DatabaseOperationResult<T = any> {
  data?: T;
  error?: string;
  status: DatabaseStatus;
} 